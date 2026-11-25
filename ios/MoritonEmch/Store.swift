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
    @Published var monthExams: [Exam] = []      // энэ сарын үзлэг (үзүүлэлт, зураг авахад)
    @Published var duties: [Duty] = []          // жижүүрийн мэдээ, ээлж хүлээлцэлт
    @Published var schedule: Rec = [:]          // clinic_config.staffSchedule
    @Published var staffToday: Rec = [:]        // staff/{өнөөдөр}
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

    // ── Ажлын хувиар, жижүүр ──
    /// Тухайн өдрийн төлөв: "work" | "duty" | "off" | ""
    func scheduleStatus(_ date: String, docId: String? = nil) -> String {
        let id = docId ?? myDocId
        guard !id.isEmpty else { return "" }
        return schedule.rec(String(date.prefix(7)))?.rec(id)?.s(date) ?? ""
    }
    var isDutyToday: Bool {
        guard !myDocId.isEmpty else { return false }
        if scheduleStatus(Day.today) == "duty" { return true }
        let list = (staffToday["duty"] as? [Any] ?? []).map { "\($0)" }
        return list.contains(myDocId)
    }
    var myDutyToday: Duty? { duties.first { $0.date == Day.today && $0.docId == myDocId } }
    /// Надад хүлээлгэн өгсөн, хүлээж аваагүй ээлж
    var incomingHandovers: [Duty] {
        guard !myDocId.isEmpty else { return [] }
        return duties.filter { $0.sent && !$0.accepted && $0.toDocId == myDocId }
    }
    var otherDoctors: [Rec] { doctors.filter { $0.s("id") != myDocId }.sorted { $0.s("name") < $1.s("name") } }

    // ── Миний үзүүлэлт (энэ сар) ──
    var myExams: [Exam] {
        monthExams.filter { $0.docName == userName || $0.assistDocName == userName }
            .sorted { $0.date == $1.date ? $0.raw.d("ms") > $1.raw.d("ms") : $0.date > $1.date }
    }
    struct Stats {
        var examsMain = 0, examsAssist = 0, planned = 0, inpLogs = 0, workDays = 0, dutyDays = 0
    }
    var stats: Stats {
        var st = Stats()
        let ym = String(Day.today.prefix(7)), today = Day.today
        for e in monthExams {
            if e.isPlanned {
                if e.docName == userName || e.assistDocName == userName { st.planned += 1 }
            } else if e.docName == userName {
                st.examsMain += 1
            } else if e.assistDocName == userName {
                st.examsAssist += 1
            }
        }
        for i in inps {
            st.inpLogs += i.logs.filter { $0.s("date").hasPrefix(ym) && ($0.s("docId") == myDocId || $0.s("docName") == userName) }.count
        }
        if let mine = schedule.rec(ym)?.rec(myDocId) {
            for (date, v) in mine {
                let status = "\(v)"
                if status == "duty" { st.dutyDays += 1 }
                if (status == "work" || status == "duty") && date <= today { st.workDays += 1 }
            }
        }
        return st
    }

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
            // Нэмэлт дата — аль нэг нь бүтэхгүй байсан ч үндсэн дэлгэцүүд ажиллана
            let monthStart = String(Day.today.prefix(7)) + "-01"
            async let cfg = try? fs.get("clinic_config", id: "main")
            async let st = try? fs.get("staff", id: Day.today)
            async let ex = try? fs.query("exams", field: "date", op: "GREATER_THAN_OR_EQUAL", value: monthStart, limit: 1500)
            async let du = try? fs.recent("duty", limit: 40)
            let (rcfg, rst, rex, rdu) = await (cfg, st, ex, du)
            if let c = rcfg ?? nil { schedule = c.rec("staffSchedule") ?? [:] }
            staffToday = (rst ?? nil) ?? [:]
            if let e = rex { monthExams = e.compactMap { Exam($0) } }
            if let x = rdu { duties = x.compactMap { Duty($0) } }
            saveCache(users: ru, doctors: rd, inps: ri, waiting: rw, labs: rl)
            write("schedule.json", [schedule])
            write("staffToday.json", [staffToday])
            write("exams.json", myExams.map { $0.raw })
            write("duty.json", duties.map { $0.raw })
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
        pending.append(["kind": "log", "inpId": inp.id, "horse": inp.horse, "log": log])
        savePending()
        inps = applyPending(inps)
        Notifier.scheduleEvening(unfinished: unfinishedCount)
        Task { await flush() }
    }

    // ── Зураг ──
    /// Зургийг утсанд хадгалаад дараалалд оруулна; сүлжээтэй бол шууд илгээнэ.
    /// col: "exams" эсвэл "inps" — зураг тэр бичлэгийн images массивт нэмэгдэнэ.
    func addPhoto(_ jpeg: Data, col: String, id: String, horse: String) {
        let imgId = Day.uid()
        let file = "photo_\(imgId).jpg"
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        do {
            try jpeg.write(to: dir.appendingPathComponent(file), options: .atomic)
        } catch {
            errorText = "Зураг хадгалж чадсангүй: \(error.localizedDescription)"
            return
        }
        pending.append(["kind": "photo", "col": col, "id": id, "horse": horse, "file": file, "imgId": imgId])
        savePending()
        Task { await flush() }
    }
    func pendingPhotos(for id: String) -> Int {
        pending.filter { $0.s("kind") == "photo" && $0.s("id") == id }.count
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

    private func send(_ p: Rec) async throws {
        if p.s("kind") == "photo" {
            let url = dir.appendingPathComponent(p.s("file"))
            guard let data = try? Data(contentsOf: url) else { return }   // файл алга — алгасна
            // Вэбтэй ижил зам: exam-images/{бичлэгийн id}/{зургийн id}.jpg
            let path = "exam-images/\(p.s("id"))/\(p.s("imgId")).jpg"
            let link = try await fs.uploadJPEG(path: path, data: data)
            let img: Rec = ["id": p.s("imgId"), "url": link, "path": path, "ms": Day.nowMs, "by": userName, "src": "ios"]
            try await fs.append(p.s("col"), id: p.s("id"), field: "images", value: img, writer: deviceId)
            try? FileManager.default.removeItem(at: url)
        } else if let log = p.rec("log") {
            try await fs.append("inps", id: p.s("inpId"), field: "log", value: log, writer: deviceId)
        }
    }

    func flush() async {
        if flushing || pending.isEmpty { return }
        flushing = true
        defer { flushing = false }
        var sentPhoto = false
        while let p = pending.first {
            do {
                try await send(p)
                if p.s("kind") == "photo" { sentPhoto = true }
                pending.removeFirst()
                savePending()
            } catch let e as FSError where e.isPermanent {
                errorText = "\(p.s("horse")): илгээгдсэнгүй — \(e.localizedDescription)"
                pending.removeFirst()
                savePending()
            } catch let e as FSError {
                errorText = "\(p.s("horse")): \(e.localizedDescription)"
                break
            } catch {
                break   // сүлжээгүй — дараа дахин оролдоно
            }
        }
        if sentPhoto && pending.isEmpty { Task { await refresh() } }
    }

    // ── Жижүүрийн мэдээ, ээлж хүлээлцэх ──
    private func dutyBase() -> Rec {
        ["id": "\(Day.today)_\(myDocId)", "date": Day.today, "docId": myDocId, "docName": userName, "ms": Day.nowMs]
    }
    private func saveDuty(id: String, data: Rec, mask: [String]) async -> Bool {
        do {
            try await fs.patch("duty", id: id, data: data, mask: mask)
            if let x = try? await fs.recent("duty", limit: 40) { duties = x.compactMap { Duty($0) } }
            errorText = nil
            return true
        } catch {
            errorText = "Хадгалагдсангүй: \(error.localizedDescription)"
            return false
        }
    }
    func saveDutyReport(_ report: Rec) async -> Bool {
        var data = dutyBase()
        data["report"] = report
        data["reportMs"] = Day.nowMs
        return await saveDuty(id: data.s("id"), data: data, mask: ["id", "date", "docId", "docName", "ms", "report", "reportMs"])
    }
    func sendHandover(toDocId: String, toName: String, note: String) async -> Bool {
        var data = dutyBase()
        data["handover"] = ["toDocId": toDocId, "toName": toName, "note": note, "sentMs": Day.nowMs,
                            "acceptedMs": 0, "acceptNote": "", "inpCount": activeInps.count] as Rec
        return await saveDuty(id: data.s("id"), data: data, mask: ["id", "date", "docId", "docName", "ms", "handover"])
    }
    func acceptHandover(_ d: Duty, note: String) async -> Bool {
        let now = Day.nowMs
        let data: Rec = ["ms": now, "handover": ["acceptedMs": now, "acceptNote": note, "acceptedBy": userName] as Rec]
        return await saveDuty(id: d.id, data: data, mask: ["ms", "handover.acceptedMs", "handover.acceptNote", "handover.acceptedBy"])
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
        schedule = read("schedule.json").first ?? [:]
        staffToday = read("staffToday.json").first ?? [:]
        monthExams = read("exams.json").compactMap { Exam($0) }
        duties = read("duty.json").compactMap { Duty($0) }
        waiting = read("waiting.json").compactMap { Wait($0) }
        labs = read("labs.json").compactMap { Lab($0) }
        inps = applyPending(read("inps.json").compactMap { Inp($0) })
    }
}
