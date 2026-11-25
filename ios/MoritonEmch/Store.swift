import Foundation
import SwiftUI
import Network
import UIKit

@MainActor
final class AppStore: ObservableObject {
    static let shared = AppStore()

    @Published var users: [Rec] = []
    @Published var doctors: [Rec] = []
    @Published var inps: [Inp] = []
    @Published var waiting: [Wait] = []
    @Published var labs: [Lab] = []
    @Published var userName: String = UserDefaults.standard.string(forKey: "user_name") ?? ""
    @Published var loading = false
    @Published var online = true
    @Published var lastSync: Date?
    @Published var errorText: String?
    @Published var pending: [Rec] = []          // сүлжээгүй үед хадгалсан, илгээгээгүй бичлэгүүд
    @Published var pushStatus = "Шалгаагүй"

    private let fs = FirestoreClient.shared
    private let monitor = NWPathMonitor()
    private var flushing = false
    let deviceId: String

    private init() {
        let d = UserDefaults.standard
        if let id = d.string(forKey: "device_id") {
            deviceId = id
        } else {
            let id = "ios_" + Day.uid()
            d.set(id, forKey: "device_id")
            deviceId = id
        }
        loadCache()
        monitor.pathUpdateHandler = { path in
            let ok = path.status == .satisfied
            Task { @MainActor in
                let store = AppStore.shared
                let was = store.online
                store.online = ok
                if ok && !was { await store.refresh() }
            }
        }
        monitor.start(queue: DispatchQueue(label: "net"))
    }

    // ── Хэрэглэгч ──
    var loggedIn: Bool { !userName.isEmpty }
    var user: Rec? { users.first { $0.s("name") == userName } }
    var role: String { user?.s("role") ?? "" }
    /// Вэбийн currentUserDoctor(): хэрэглэгчийн нэртэй ижил нэртэй эмч
    var me: Rec? { doctors.first { $0.s("name") == userName } }
    var myDocId: String { me?.s("id") ?? "" }

    func login(name: String, password: String) -> Bool {
        guard let u = users.first(where: { $0.s("name") == name }) else { return false }
        let hash = u.s("pwHash")
        let ok = !hash.isEmpty ? Hash.password(password) == hash : (!u.s("pw").isEmpty && u.s("pw") == password)
        guard ok else { return false }
        userName = name
        UserDefaults.standard.set(name, forKey: "user_name")
        Task { await registerDevice() }
        return true
    }

    func logout() {
        userName = ""
        UserDefaults.standard.removeObject(forKey: "user_name")
        Notifier.cancelEvening()
    }

    // ── Миний ажил ──
    private func isMine(_ i: Inp) -> Bool {
        guard let m = me else { return false }
        if !i.docId.isEmpty { return i.docId == m.s("id") }
        return !i.docName.isEmpty && i.docName == m.s("name")
    }
    var myTasks: [Inp] {
        let today = Day.today
        guard !myDocId.isEmpty else { return [] }
        return inps
            .filter { ($0.assign(on: today)?.s("docId") ?? "") == myDocId && $0.inHospital(on: today) }
            .sorted { a, b in
                let da = a.done(on: today), db = b.done(on: today)
                return da == db ? a.location < b.location : (!da && db)
            }
    }
    var myOthers: [Inp] {
        let taskIds = Set(myTasks.map { $0.id })
        return inps.filter { !$0.discharged && isMine($0) && !taskIds.contains($0.id) }
    }
    var activeInps: [Inp] { inps.filter { !$0.discharged }.sorted { $0.location < $1.location } }
    var clinicWaiting: [Wait] { waiting.filter { !$0.isFieldTrip }.sorted { $0.raw.d("ms") < $1.raw.d("ms") } }
    var openLabs: [Lab] { labs.filter { $0.isOpen } }
    var unfinishedCount: Int { myTasks.filter { !$0.done(on: Day.today) }.count }

    // ── Татах ──
    func refresh() async {
        if loading { return }
        loading = true
        defer { loading = false }
        await flush()
        do {
            async let u = fs.list("users")
            async let d = fs.list("doctors")
            async let i = fs.list("inps")
            async let w = fs.list("waiting")
            async let l = fs.recent("labs", limit: 80)
            let (ru, rd, ri, rw, rl) = try await (u, d, i, w, l)
            users = ru
            doctors = rd
            waiting = rw.compactMap { Wait($0) }
            labs = rl.compactMap { Lab($0) }
            inps = applyPending(ri.compactMap { Inp($0) })
            lastSync = Date()
            errorText = nil
            saveCache(users: ru, doctors: rd, inps: ri, waiting: rw, labs: rl)
            Notifier.scheduleEvening(unfinished: unfinishedCount)
        } catch let e as FSError {
            errorText = e.localizedDescription
        } catch {
            // Сүлжээгүй: кэшээр ажиллана
            if online { errorText = error.localizedDescription }
        }
    }

    // ── Өдрийн эмчилгээ бичих ──
    func addLog(to inp: Inp, temp: String, pulse: String, resp: String, weight: String, slot: String, note: String) {
        let log: Rec = [
            "id": Day.uid(),
            "date": Day.today,
            "slot": slot,
            "docId": myDocId,
            "docName": me?.s("name") ?? userName,
            "diagnosis": "",
            "note": note,
            "temp": temp, "pulse": pulse, "resp": resp, "wt": weight,
            "services": [Any](), "meds": [Any](),
            "amount": 0,
            "ms": Day.nowMs,
            "src": "ios"
        ]
        pending.append(["inpId": inp.id, "horse": inp.horse, "log": log])
        savePending()
        inps = applyPending(inps)
        Notifier.scheduleEvening(unfinished: unfinishedCount)
        Task { await flush() }
    }

    /// Илгээгээгүй бичлэгүүдийг дэлгэц дээр харагдуулна (серверээс дахин татсан ч алга болохгүй)
    private func applyPending(_ list: [Inp]) -> [Inp] {
        guard !pending.isEmpty else { return list }
        var out = list
        for p in pending {
            guard let log = p.rec("log"), let idx = out.firstIndex(where: { $0.id == p.s("inpId") }) else { continue }
            var logs = out[idx].logs
            if logs.contains(where: { $0.s("id") == log.s("id") }) { continue }
            logs.append(log)
            out[idx].raw["log"] = logs
        }
        return out
    }

    func flush() async {
        if flushing || pending.isEmpty { return }
        flushing = true
        defer { flushing = false }
        while let p = pending.first {
            guard let log = p.rec("log") else { pending.removeFirst(); continue }
            do {
                try await fs.appendLog(inpId: p.s("inpId"), log: log, writer: deviceId)
                pending.removeFirst()
                savePending()
            } catch let e as FSError where e.isPermanent {
                errorText = "\(p.s("horse")): бичлэг илгээгдсэнгүй — \(e.localizedDescription)"
                pending.removeFirst()
                savePending()
            } catch {
                break   // сүлжээгүй — дараа дахин оролдоно
            }
        }
    }

    // ── Мэдэгдлийн төхөөрөмж бүртгэх ──
    func registerDevice() async {
        guard loggedIn, let token = UserDefaults.standard.string(forKey: "apns_token"), !token.isEmpty else { return }
        let rec: Rec = [
            "id": deviceId, "token": token, "env": Config.apnsEnv, "platform": "ios",
            "user": userName, "docId": myDocId, "role": role,
            "model": UIDevice.current.model, "ms": Day.nowMs
        ]
        do {
            try await fs.set("devices", id: deviceId, data: rec)
            pushStatus = "Бүртгэгдсэн"
        } catch {
            pushStatus = "Сервер бүртгээгүй: \(error.localizedDescription)"
        }
    }

    // ── Утсан дээрх хуулбар (сүлжээгүй үед) ──
    private var dir: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
    }
    private func write(_ name: String, _ obj: Any) {
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        guard JSONSerialization.isValidJSONObject(obj), let data = try? JSONSerialization.data(withJSONObject: obj) else { return }
        try? data.write(to: dir.appendingPathComponent(name), options: .atomic)
    }
    private func read(_ name: String) -> [Rec] {
        guard let data = try? Data(contentsOf: dir.appendingPathComponent(name)),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [Any] else { return [] }
        return arr.compactMap { $0 as? Rec }
    }
    private func saveCache(users: [Rec], doctors: [Rec], inps: [Rec], waiting: [Rec], labs: [Rec]) {
        write("users.json", users)
        write("doctors.json", doctors)
        write("inps.json", inps.filter { !$0.b("discharged") })   // зөвхөн одоо байрлаж буй
        write("waiting.json", waiting)
        write("labs.json", labs)
    }
    private func savePending() { write("pending.json", pending) }
    private func loadCache() {
        users = read("users.json")
        doctors = read("doctors.json")
        pending = read("pending.json")
        waiting = read("waiting.json").compactMap { Wait($0) }
        labs = read("labs.json").compactMap { Lab($0) }
        inps = applyPending(read("inps.json").compactMap { Inp($0) })
    }
}
