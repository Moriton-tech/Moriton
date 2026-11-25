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
    @Published var monthExams: [Exam] = []      // миний хийсэн / хамтарсан БҮХ үзлэг (түүх, үзүүлэлт)
    @Published var config: Rec = [:]            // clinic_config/main
    private var recentExamNums: [Rec] = []      // хуудасны дугаар тооцоход
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
        avatar = nil
        try? FileManager.default.removeItem(at: avatarURL)
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

    // ── Үзлэг явагдаж байгааг бусдад харуулах ──
    /// Хүлээлтийн бичлэгт «хэн үзэж байна» тэмдэг тавина / авна. Бичлэг аль хэдийн алга бол юу ч хийхгүй.
    func markExamining(_ w: Wait, on: Bool) {
        let data: Rec = ["examBy": on ? userName : "", "examByMs": on ? Day.nowMs : 0, "examDevice": on ? deviceId : ""]
        if let idx = waiting.firstIndex(where: { $0.id == w.id }) {
            var r = waiting[idx].raw
            for (k, v) in data { r[k] = v }
            if let nw = Wait(r) { waiting[idx] = nw }
        }
        Task { try? await fs.update("waiting", id: w.id, data: data, mask: ["examBy", "examByMs", "examDevice"]) }
    }
    /// Хүлээлтийг хөнгөн шинэчлэх (20 секунд тутам) — шинэ адуу, «үзлэг явагдаж байна» тэмдэг хурдан харагдана
    func refreshWaiting() async {
        guard loggedIn, online, !loading else { return }
        if let rw = try? await fs.list("waiting") { waiting = rw.compactMap { Wait($0) } }
    }

    // ── Миний загварууд (зөвлөгөө, эм тариа) ──
    @Published var templates: [Rec] = []
    var myTemplates: [Rec] { templates.filter { !$0.b("deleted") }.sorted { $0.s("title") < $1.s("title") } }

    func saveTemplate(id: String?, title: String, diagnosis: String, note: String, services: [String], meds: [Rec]) {
        var t: Rec = ["id": id ?? Day.uid(), "docId": myDocId, "owner": userName, "title": title, "diagnosis": diagnosis, "note": note]
        t["services"] = services
        t["meds"] = meds
        t["ms"] = Day.nowMs
        t["deleted"] = false
        putTemplate(t)
    }
    func deleteTemplate(_ id: String) {
        guard var t = templates.first(where: { $0.s("id") == id }) else { return }
        t["deleted"] = true
        t["ms"] = Day.nowMs
        putTemplate(t)
    }
    private func putTemplate(_ t: Rec) {
        templates.removeAll { $0.s("id") == t.s("id") }
        templates.append(t)
        write("templates.json", templates)
        Task {
            do {
                try await fs.set("templates", id: t.s("id"), data: t)
            } catch {
                errorText = "Загвар утсанд хадгалагдсан, сервэрт хадгалагдсангүй: \(error.localizedDescription)"
            }
        }
    }
    private func mergeTemplates(_ remote: [Rec]) {
        var byId: [String: Rec] = [:]
        for t in templates { byId[t.s("id")] = t }
        for r in remote where r.d("ms") >= (byId[r.s("id")]?.d("ms") ?? 0) { byId[r.s("id")] = r }
        templates = Array(byId.values)
        write("templates.json", templates)
    }

    // ── Миний урамшуулал (вэбийн computeBonus()-тай ижил дүрэм) ──
    @Published var trips: [Rec] = []
    struct BonusLine: Identifiable {
        var id: String { label }
        let label: String
        let count: Int
        let amount: Double
    }
    struct Bonus {
        var lines: [BonusLine] = []          // үндсэн үзлэг: ангиллаар + хамтарсан
        var mainTotal = 0.0
        var tripLines: [BonusLine] = []      // төлөвлөгөөт үзлэг: ээлжээр
        var tripTotal = 0.0
        var skipped = 0
        var total: Double { mainTotal + tripTotal }
    }
    private func bonusCfg() -> Rec { config.rec("bonusCfg") ?? [:] }
    private func bonusNum(_ key: String, _ def: Double) -> Double { bonusCfg()[key] == nil ? def : bonusCfg().d(key) }
    private func bonusCategory(_ e: Exam) -> String {
        let cats = ["Клиник", "Зонд", "Дуудлага", "Клиник дуудлага", "Төлөвлөгөөт"]
        if cats.contains(e.raw.s("bonusCat")) { return e.raw.s("bonusCat") }
        if e.isPlanned { return "Төлөвлөгөөт" }
        let cfg = bonusCfg()
        let kwZond = (cfg["kwZond"] == nil ? "Зонд" : cfg.s("kwZond")).lowercased()
        let kwCall = (cfg["kwCall"] == nil ? "Дуудлага" : cfg.s("kwCall")).lowercased()
        let names = e.serviceNames.map { $0.trimmingCharacters(in: .whitespaces).lowercased() }.filter { !$0.isEmpty }
        if !kwZond.isEmpty && names.contains(where: { $0.contains(kwZond) }) { return "Зонд" }
        let calls = kwCall.isEmpty ? 0 : names.filter { $0.hasPrefix(kwCall) }.count
        if calls > 0 { return calls < names.count ? "Клиник дуудлага" : "Дуудлага" }
        return "Клиник"
    }
    /// Үндсэн үзлэгийн урамшуулал — ганцаараа / үндсэн эмч / хамтрагч эмчийн тогтмол дүнгээр
    func bonusMain(ym: String) -> Bonus {
        var b = Bonus()
        let alone = bonusNum("alone", 10000), mainRate = bonusNum("main", 6000), assistRate = bonusNum("assist", 4000)
        var cats: [String: (Int, Double)] = [:]
        var assistN = 0
        for e in monthExams where e.date.hasPrefix(ym) {
            let cat = bonusCategory(e)
            if cat == "Төлөвлөгөөт" { continue }
            if e.raw.b("bonusSkip") || e.docName.isEmpty || e.docName == "—" { b.skipped += 1; continue }
            let hasAssist = !e.assistDocName.isEmpty || !e.raw.s("assistDocId").isEmpty
            if e.docName == userName {
                let cur = cats[cat] ?? (0, 0)
                cats[cat] = (cur.0 + 1, cur.1 + (hasAssist ? mainRate : alone))
            } else if e.assistDocName == userName {
                assistN += 1
            }
        }
        for c in ["Клиник", "Зонд", "Дуудлага", "Клиник дуудлага"] {
            if let v = cats[c] { b.lines.append(BonusLine(label: c, count: v.0, amount: v.1)) }
        }
        if assistN > 0 { b.lines.append(BonusLine(label: "Хамтарсан эмчээр", count: assistN, amount: Double(assistN) * assistRate)) }
        b.mainTotal = b.lines.reduce(0) { $0 + $1.amount }
        return b
    }
    /// Төлөвлөгөөт үзлэгийн урамшуулал — ээлж (явц) бүрийн сангаас миний хувь. Ээлжийн бүх үзлэгийг сервэрээс татна.
    func bonusTrips(ym: String) async -> [BonusLine] {
        let cfg = bonusCfg()
        let rate = bonusNum("plRate", 10000)
        let excl = (cfg["plExcl"] as? [Any] ?? ["хээл шалгах"]).map { "\($0)".trimmingCharacters(in: .whitespaces).lowercased() }.filter { !$0.isEmpty }
        var out: [BonusLine] = []
        for t in trips {
            let b = t.rec("bonus") ?? [:]
            let ids: [String] = (t["docIds"] as? [Any])?.map { "\($0)" } ?? [t.s("docId"), t.s("assistDocId")]
            let docNames = ids.filter { !$0.isEmpty }.compactMap { id in doctors.first { $0.s("id") == id }?.s("name") }
            let named = b.rec("names") ?? [:]
            func name(_ k: String, _ i: Int?) -> String {
                if named[k] != nil { return named.s(k).trimmingCharacters(in: .whitespaces) }
                if let i = i, i < docNames.count { return docNames[i] }
                return ""
            }
            let size = Int(b.d("size")) == 5 ? 5 : 4
            let p = cfg.rec(size == 5 ? "pl5" : "pl4") ?? [:]
            func pct(_ k: String, _ def: Double) -> Double { p[k] == nil ? def : p.d(k) }
            var slots: [(String, String, Double)] = [
                ("reg", name("reg", nil), pct("reg", 25)), ("senior", name("senior", 0), pct("senior", 35)),
                ("co1", name("co1", 1), pct("co", size == 5 ? 15 : 20)), ("co2", name("co2", 2), pct("co", size == 5 ? 15 : 20))
            ]
            if size == 5 { slots.append(("driver", name("driver", nil), pct("driver", 10))) }
            if !slots.contains(where: { $0.1 == userName }) { continue }
            guard let all = try? await fs.query("exams", field: "tripId", op: "EQUAL", value: t.s("id"), limit: 3000) else { continue }
            let inMonth = all.filter { $0.s("kind") == "planned" && $0.s("date").hasPrefix(ym) }
            let startYm = String(t.s("date").prefix(7))
            if inMonth.isEmpty && startYm != ym { continue }
            let eligible = inMonth.filter { (e: Rec) -> Bool in
                if e.b("bonusSkip") { return false }
                let names = (e["services"] as? [Any] ?? []).compactMap { ($0 as? Rec)?.s("name").trimmingCharacters(in: .whitespaces).lowercased() }.filter { !$0.isEmpty }
                if names.isEmpty || excl.isEmpty { return true }
                return names.contains { n in !excl.contains { k in n == k || n.contains(k) } }
            }.count
            let manual = startYm == ym && b["pool"] != nil && !(b["pool"] is NSNull) && !b.s("pool").isEmpty
            let pool = manual ? b.d("pool") : Double(eligible) * rate
            let pctSum = slots.reduce(0.0) { $0 + $1.2 }
            var mine = 0.0, allocated = 0.0
            for s in slots {
                let amt = (pool * s.2 / 100).rounded()
                allocated += amt
                if s.1 == userName { mine += amt }
            }
            // Бутархайн зөрүү ахлах эмчид (вэбтэй ижил)
            if pctSum == 100, slots.first(where: { $0.0 == "senior" })?.1 == userName { mine += pool - allocated }
            let route = t.s("route").isEmpty ? t.s("date") : t.s("route")
            out.append(BonusLine(label: "\(t.s("date")) · \(route)", count: eligible, amount: mine))
        }
        return out
    }

    // ── Эрх (вэбийн canAccess()-тай ижил: хэрэглэгчийн pages, байхгүй бол дүрийн анхдагч) ──
    var pages: [String] {
        guard let u = user else { return [] }
        if let p = u["pages"] as? [Any] { return p.compactMap { $0 as? String } }
        if let other = users.first(where: { $0.s("role") == role && $0["pages"] is [Any] }), let p = other["pages"] as? [Any] {
            return p.compactMap { $0 as? String }
        }
        return Catalog.rolePages[role] ?? ["dashboard"]
    }
    func can(_ page: String) -> Bool {
        if pages.contains(page) { return true }
        if page == "review" { return canReviewActs || ["Ерөнхий эмч", "Админ"].contains(role) }
        return false
    }
    /// Үзлэг хийх: «Үзлэг» хуудасны эрхтэй, эмчийн бүртгэлтэй холбогдсон хэрэглэгч
    var canExam: Bool { me != nil && can("exam") }
    /// Өдрийн эмчилгээ бичих, зураг нэмэх: «Байрлан эмчлүүлэх» хуудасны эрхтэй эмч
    var canTreat: Bool { me != nil && can("inpatient") }
    /// Өглөөний хуваарилалт хийх (вэбийн asgCanAssign())
    var canAssign: Bool { canReviewActs || ["Ерөнхий эмч", "Ахлах эмч", "Админ", "Менежер"].contains(role) }
    var isSenior: Bool { canReviewActs || canAssign }

    // ── Ахлах эмчийн хяналт ──
    @Published var reviewExams: [Exam] = []      // батлагдахыг хүлээж буй бүх эмчийн онош
    var pendingReview: [Exam] { reviewExams.filter { $0.raw.s("dxStatus") == "pending" && !$0.isPlanned }.sorted { $0.raw.d("ms") < $1.raw.d("ms") } }
    var hospitalToday: [Inp] { inps.filter { !$0.discharged && $0.inHospital(on: Day.today) }.sorted { $0.location < $1.location } }
    var unassigned: [Inp] { hospitalToday.filter { $0.assign(on: Day.today) == nil } }
    /// Өнөөдөр хуваарилагдсан ч эмчилгээ бичигдээгүй адуунууд
    var notWritten: [Inp] { hospitalToday.filter { $0.assign(on: Day.today) != nil && !$0.done(on: Day.today) } }
    var actsToReview: Int { canReviewActs ? duties.filter { $0.sent && !$0.reviewed }.count : 0 }

    private func stampNow() -> Rec { ["ms": Day.nowMs, "_updatedAt": Day.nowMs, "_writer": deviceId] }
    private func logWrite(action: String, target: String, name: String, details: String, examNum: String) async -> [String: Any] {
        let now = Day.nowMs
        var log: Rec = ["id": "log_" + String(Int64(now)) + "_" + String(Day.uid().suffix(4)), "user_name": userName, "user_role": role]
        log["action"] = action
        log["target_id"] = target
        log["target_name"] = name
        log["exam_id"] = examNum
        log["details"] = details + " · утасны аппаас"
        log["log_date"] = Day.today
        log["log_ms"] = now
        log["_updatedAt"] = now
        log["_writer"] = deviceId
        return ["update": ["name": await fs.docName("logs", log.s("id")), "fields": FSValue.encodeFields(log)], "currentDocument": ["exists": false]]
    }

    /// Онош батлах (засаж баталж болно) — вэбийн approveDx()
    func approveDx(_ e: Exam, text: String) async -> Bool {
        guard canReviewActs else { errorText = "Онош батлах эрх ахлах эмчид байна"; return false }
        let before = e.diagnosis
        let newText = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !newText.isEmpty else { errorText = "Онош хоосон байна"; return false }
        let changed = newText != before
        let now = Day.nowMs
        var data = stampNow()
        data["diagnosis"] = newText
        data["dxStatus"] = "approved"
        data["dxApprovedBy"] = userName
        data["dxApprovedMs"] = now
        data["dxAuto"] = false
        data["dxReturnNote"] = ""
        var mask = ["ms", "_updatedAt", "_writer", "diagnosis", "dxStatus", "dxApprovedBy", "dxApprovedMs", "dxAuto", "dxReturnNote"]
        if changed && e.raw.s("dxOriginal").isEmpty { data["dxOriginal"] = before; mask.append("dxOriginal") }
        var hist: Rec = ["ms": now, "by": userName, "action": changed ? "approve_edit" : "approve", "text": newText]
        if changed { hist["prev"] = before }
        var writes: [[String: Any]] = [[
            "update": ["name": await fs.docName("exams", e.id), "fields": FSValue.encodeFields(data)],
            "updateMask": ["fieldPaths": mask],
            "updateTransforms": [["fieldPath": "dxHistory", "appendMissingElements": ["values": [FSValue.encode(hist)]]]],
            "currentDocument": ["exists": true]
        ]]
        // Онош өөрчлөгдвөл холбогдох байрлан эмчилгээний «анхны онош»-ийг мөн шинэчилнэ
        if changed {
            for i in inps where i.raw.s("examId") == e.id && (i.diagnosis.isEmpty || i.diagnosis == before) {
                var d = stampNow()
                d["diagnosis"] = newText
                writes.append(["update": ["name": await fs.docName("inps", i.id), "fields": FSValue.encodeFields(d)],
                               "updateMask": ["fieldPaths": ["ms", "_updatedAt", "_writer", "diagnosis"]],
                               "currentDocument": ["exists": true]])
            }
        }
        writes.append(await logWrite(action: changed ? "Онош засаж баталсан" : "Онош баталсан", target: e.id,
                                     name: e.horse + " — " + e.docName,
                                     details: changed ? "«" + before + "» → «" + newText + "»" : "Онош: " + newText, examNum: e.examNum))
        return await sendReview(writes, examId: e.id)
    }
    /// Онош буцаах — вэбийн returnDx()
    func returnDx(_ e: Exam, note: String) async -> Bool {
        guard canReviewActs else { errorText = "Онош буцаах эрх ахлах эмчид байна"; return false }
        let reason = note.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !reason.isEmpty else { errorText = "Буцаах шалтгаанаа бичнэ үү"; return false }
        let now = Day.nowMs
        var data = stampNow()
        data["dxStatus"] = "returned"
        data["dxReturnNote"] = reason
        data["dxReturnedBy"] = userName
        data["dxReturnedMs"] = now
        let hist: Rec = ["ms": now, "by": userName, "action": "return", "text": e.diagnosis, "note": reason]
        var writes: [[String: Any]] = [[
            "update": ["name": await fs.docName("exams", e.id), "fields": FSValue.encodeFields(data)],
            "updateMask": ["fieldPaths": ["ms", "_updatedAt", "_writer", "dxStatus", "dxReturnNote", "dxReturnedBy", "dxReturnedMs"]],
            "updateTransforms": [["fieldPath": "dxHistory", "appendMissingElements": ["values": [FSValue.encode(hist)]]]],
            "currentDocument": ["exists": true]
        ]]
        writes.append(await logWrite(action: "Онош буцаасан", target: e.id, name: e.horse + " — " + e.docName,
                                     details: "Шалтгаан: " + reason, examNum: e.examNum))
        return await sendReview(writes, examId: e.id)
    }
    private func sendReview(_ writes: [[String: Any]], examId: String) async -> Bool {
        do {
            try await fs.commit(writes)
            reviewExams.removeAll { $0.id == examId }
            errorText = nil
            Task { await refresh() }
            return true
        } catch {
            errorText = "Хадгалагдсангүй: \(error.localizedDescription)"
            return false
        }
    }

    /// Өглөөний хуваарилалт — вэбийн asgSave(): зөвхөн тухайн өдрийн хуваарилалтын талбарыг бичнэ
    func saveAssignments(_ rows: [(inp: Inp, docId: String, task: String)]) async -> Bool {
        guard canAssign else { errorText = "Хуваарилах эрхгүй (ахлах эмч, менежер, админ)"; return false }
        let date = Day.today, now = Day.nowMs
        var writes: [[String: Any]] = []
        var names: [String] = []
        for r in rows {
            let d = doctors.first { $0.s("id") == r.docId }
            let a: Rec = ["docId": d?.s("id") ?? "", "docName": d?.s("name") ?? "",
                          "task": d == nil ? "" : r.task.trimmingCharacters(in: .whitespacesAndNewlines), "by": userName, "ms": now]
            var data = stampNow()
            data["assigns"] = [date: a] as Rec
            writes.append(["update": ["name": await fs.docName("inps", r.inp.id), "fields": FSValue.encodeFields(data)],
                           "updateMask": ["fieldPaths": ["ms", "_updatedAt", "_writer", "assigns.`" + date + "`"]],
                           "currentDocument": ["exists": true]])
            names.append(r.inp.horse + "→" + (d?.s("name") ?? "—"))
        }
        guard !writes.isEmpty else { return true }
        writes.append(await logWrite(action: "Өглөөний хуваарилалт", target: "", name: date,
                                     details: String(names.count) + " адуу: " + String(names.joined(separator: ", ").prefix(300)), examNum: ""))
        do {
            try await fs.commit(writes)
            errorText = nil
            await refresh()
            return true
        } catch {
            errorText = "Хуваарилалт хадгалагдсангүй: \(error.localizedDescription)"
            return false
        }
    }

    // ── Цэс хоорондын шилжилт ──
    @Published var mainTab = 0                  // 0 Нүүр · 1 Миний ажил · 2 Байрлан · 3 Шинжилгээ · 4 Би
    @Published var workTab: WorkTab = .waiting

    // ── Профайл зураг, тохиргоо ──
    @Published var avatar: UIImage?
    @Published var muted: Set<String> = Set(UserDefaults.standard.stringArray(forKey: "muted") ?? [])
    @Published var eveningReminder: Bool = UserDefaults.standard.object(forKey: "evening_reminder") as? Bool ?? true

    private var profileId: String { myDocId.isEmpty ? deviceId : myDocId }
    private var avatarURL: URL { dir.appendingPathComponent("avatar.jpg") }

    func setAvatar(_ jpeg: Data) {
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        try? jpeg.write(to: avatarURL, options: .atomic)
        avatar = UIImage(data: jpeg)
        let id = profileId, name = userName
        Task {
            do {
                try await fs.patch("profiles", id: id, data: ["id": id, "name": name, "photo": jpeg.base64EncodedString(), "ms": Day.nowMs],
                                   mask: ["id", "name", "photo", "ms"])
            } catch {
                errorText = "Профайл зураг утсанд хадгалагдсан, сервэрт хадгалагдсангүй: \(error.localizedDescription)"
            }
        }
    }
    private func loadAvatarFromServer() async {
        guard avatar == nil, loggedIn, let p = (try? await fs.get("profiles", id: profileId)) ?? nil,
              let data = Data(base64Encoded: p.s("photo")), let img = UIImage(data: data) else { return }
        try? data.write(to: avatarURL, options: .atomic)
        avatar = img
    }
    func setMuted(_ kind: String, _ off: Bool) {
        if off { muted.insert(kind) } else { muted.remove(kind) }
        UserDefaults.standard.set(Array(muted), forKey: "muted")
        Task { await registerDevice() }
    }
    func setEveningReminder(_ on: Bool) {
        eveningReminder = on
        UserDefaults.standard.set(on, forKey: "evening_reminder")
        remind()
    }
    private func remind() {
        if eveningReminder { Notifier.scheduleEvening(unfinished: unfinishedCount) } else { Notifier.cancelEvening() }
    }

    // ── KPI (мөнгөн дүнгүй) ──
    enum KPIBucket { case day, week, month }
    struct KPIPoint: Identifiable {
        let id: String
        let label: String
        let kind: String
        let count: Int
    }
    struct KPICount: Identifiable {
        var id: String { label }
        let label: String
        let count: Int
    }
    struct KPI {
        var main = 0, assist = 0, planned = 0, horses = 0, services = 0, inpLogs = 0
        var workedDays = 0, schedDays = 0, dutyDays = 0
        var avgMinutes: Double? = nil
        var points: [KPIPoint] = []
        var topServices: [KPICount] = []
        var topDiagnoses: [KPICount] = []
    }

    /// Вэбийн KPI самбарын нэг эмчийн мөртэй ижил тооцоо: үзлэг, хамтарсан, үйлчилгээ, адуу, ажилласан өдөр, дундаж хугацаа
    func kpi(from: String, to: String, bucket: KPIBucket) -> KPI {
        var k = KPI()
        let kinds = ["Үзлэг", "Хамтарсан", "Байрлан эмчилгээ"]
        func label(_ date: String) -> String {
            switch bucket {
            case .day: return String(date.suffix(5)).replacingOccurrences(of: "-", with: ".")
            case .month: return String(Int(date.dropFirst(5).prefix(2)) ?? 0) + " сар"
            case .week:
                let f = DateFormatter()
                f.calendar = Calendar(identifier: .gregorian)
                f.locale = Locale(identifier: "en_US_POSIX")
                f.dateFormat = "yyyy-MM-dd"
                guard let d = f.date(from: date) else { return date }
                let wd = Calendar(identifier: .gregorian).component(.weekday, from: d)
                let monday = Day.add(date, days: -((wd + 5) % 7))
                return String(monday.suffix(5)).replacingOccurrences(of: "-", with: ".")
            }
        }
        // Хугацааны бүх хэсгийг дарааллаар нь бэлдэнэ (хоосон өдөр ч графикт харагдана)
        var order: [String] = []
        var counts: [String: [String: Int]] = [:]
        var date = from
        var guardN = 0
        while date <= to && guardN < 400 {
            let l = label(date)
            if counts[l] == nil { counts[l] = [:]; order.append(l) }
            let st = scheduleStatus(date)
            if st == "work" || st == "duty" { k.schedDays += 1 }
            if st == "duty" { k.dutyDays += 1 }
            date = Day.add(date, days: 1)
            guardN += 1
        }
        func bump(_ date: String, _ kind: String) {
            let l = label(date)
            counts[l, default: [:]][kind, default: 0] += 1
        }
        var horses = Set<String>(), days = Set<String>()
        var svc: [String: Int] = [:], dx: [String: Int] = [:]
        var durSum = 0.0, durN = 0
        for e in monthExams where e.date >= from && e.date <= to {
            let horse = e.raw.s("horseId").isEmpty ? e.horse : e.raw.s("horseId")
            if e.docName == userName {
                k.main += 1
                if e.isPlanned { k.planned += 1 }
                k.services += e.serviceNames.count
                for s in e.serviceNames { svc[s, default: 0] += 1 }
                let d = e.diagnosis.trimmingCharacters(in: .whitespacesAndNewlines)
                if !d.isEmpty { dx[d, default: 0] += 1 }
                if let m = e.raw["durationMin"] as? Double { durSum += m; durN += 1 }
                bump(e.date, kinds[0])
            } else if e.assistDocName == userName {
                k.assist += 1
                bump(e.date, kinds[1])
            } else {
                continue
            }
            horses.insert(horse)
            days.insert(e.date)
        }
        for i in inps {
            for l in i.logs {
                let d = String(l.s("date").prefix(10))
                if d < from || d > to { continue }
                if l.s("docId") != myDocId && l.s("docName") != userName { continue }
                k.inpLogs += 1
                days.insert(d)
                bump(d, kinds[2])
            }
        }
        k.horses = horses.count
        k.workedDays = days.count
        k.avgMinutes = durN > 0 ? durSum / Double(durN) : nil
        for l in order {
            for kind in kinds {
                k.points.append(KPIPoint(id: l + "|" + kind, label: l, kind: kind, count: counts[l]?[kind] ?? 0))
            }
        }
        k.topServices = svc.sorted { $0.value == $1.value ? $0.key < $1.key : $0.value > $1.value }.prefix(6)
            .map { KPICount(label: $0.key, count: $0.value) }
        k.topDiagnoses = dx.filter { $0.value > 1 }.sorted { $0.value == $1.value ? $0.key < $1.key : $0.value > $1.value }.prefix(6)
            .map { KPICount(label: $0.key, count: $0.value) }
        return k
    }

    // ── Нүүр ──
    var myExamsToday: Int { monthExams.filter { $0.date == Day.today }.count }
    var myReturnedDx: [Exam] { monthExams.filter { $0.raw.s("dxStatus") == "returned" && !$0.isPlanned } }
    var myPendingDx: Int { monthExams.filter { $0.raw.s("dxStatus") == "pending" && !$0.isPlanned }.count }
    var myOpenLabs: Int { labs.filter { $0.isOpen && $0.docName == userName }.count }

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
        monthExams.sorted { $0.date == $1.date ? $0.raw.d("ms") > $1.raw.d("ms") : $0.date > $1.date }
    }
    struct Stats {
        var examsMain = 0, examsAssist = 0, planned = 0, inpLogs = 0, workDays = 0, dutyDays = 0
    }
    var stats: Stats {
        var st = Stats()
        let ym = String(Day.today.prefix(7)), today = Day.today
        for e in monthExams where e.date.hasPrefix(ym) {
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
            let name = userName
            async let cfg = try? fs.get("clinic_config", id: "main")
            async let st = try? fs.get("staff", id: Day.today)
            async let ex = try? fs.query("exams", field: "docName", op: "EQUAL", value: name, limit: 5000)
            async let ex2 = try? fs.query("exams", field: "assistDocName", op: "EQUAL", value: name, limit: 5000)
            async let du = try? fs.recent("duty", limit: 40)
            async let nums = try? fs.recent("exams", limit: 40)
            async let tr = try? fs.list("trips")
            async let tp = try? fs.query("templates", field: "docId", op: "EQUAL", value: myDocId, limit: 300)
            let (rcfg, rst, rex, rex2, rdu, rnums) = await (cfg, st, ex, ex2, du, nums)
            let (rtr, rtp) = await (tr, tp)
            if canReviewActs, let rv = try? await fs.query("exams", field: "dxStatus", op: "EQUAL", value: "pending", limit: 300) {
                reviewExams = rv.compactMap { Exam($0) }
            }
            if let t = rtr { trips = t }
            if let t = rtp, !myDocId.isEmpty { mergeTemplates(t) }
            if let c = rcfg ?? nil {
                config = c
                schedule = c.rec("staffSchedule") ?? [:]
            }
            staffToday = (rst ?? nil) ?? [:]
            if !name.isEmpty, let a = rex {
                var seen = Set<String>()
                monthExams = (a + (rex2 ?? [])).compactMap { Exam($0) }.filter { seen.insert($0.id).inserted }
            }
            if let x = rdu { duties = x.compactMap { Duty($0) } }
            if let n = rnums { recentExamNums = n }
            write("config.json", [config])
            saveCache(users: ru, doctors: rd, inps: ri, waiting: rw, labs: rl)
            write("schedule.json", [schedule])
            write("staffToday.json", [staffToday])
            write("exams.json", myExams.map { $0.raw })
            write("duty.json", duties.map { $0.raw })
            remind()
            await loadAvatarFromServer()
        } catch let e as FSError {
            errorText = e.localizedDescription
        } catch {
            // Сүлжээгүй: кэшээр ажиллана
            if online { errorText = error.localizedDescription }
        }
    }

    // ── Өдрийн эмчилгээ бичих ──
    func addLog(to inp: Inp, temp: String, pulse: String, resp: String, weight: String, slot: String, note: String,
                diagnosis: String = "", services: [Rec] = [], meds: [Rec] = []) {
        let svcTotal: Double = services.reduce(0) { $0 + $1.d("price") }
        let medTotal: Double = meds.reduce(0) { $0 + $1.d("price") }
        let amount = svcTotal + medTotal
        var log: Rec = [
            "id": Day.uid(), "date": Day.today, "slot": slot,
            "docId": myDocId, "docName": me?.s("name") ?? userName
        ]
        log["diagnosis"] = diagnosis
        log["note"] = note
        log["temp"] = temp
        log["pulse"] = pulse
        log["resp"] = resp
        log["wt"] = weight
        log["services"] = services
        log["meds"] = meds
        log["amount"] = amount
        log["ms"] = Day.nowMs
        log["src"] = "ios"
        pending.append(["kind": "log", "inpId": inp.id, "horse": inp.horse, "log": log])
        savePending()
        inps = applyPending(inps)
        remind()
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

    // ── Үзлэг (хүлээлтээс авч үзэх) ──
    private func strings(_ key: String) -> [String] { (config[key] as? [Any] ?? []).compactMap { $0 as? String } }
    /// Вэбийн getAllServices(): үндсэн жагсаалт − хассан + нэмсэн
    var services: [String] {
        let removed = Set(strings("removedServices"))
        let base = Catalog.services.filter { !removed.contains($0) }
        let custom = strings("customServices").filter { !removed.contains($0) && !Catalog.services.contains($0) }
        return base + custom
    }
    func price(of service: String) -> Double { config.rec("servicePrices")?.d(service) ?? 0 }
    var medNames: [String] {
        let cat = config.recs("medCatalog").filter { !$0.b("deleted") }.map { $0.s("name") }.filter { !$0.isEmpty }
        var seen = Set<String>()
        return (cat + Catalog.meds).filter { seen.insert($0).inserted }
    }
    private func medKey(_ s: String) -> String { s.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() }
    /// Вэбийн medCatFind(): каталогийн эм (нэр эсвэл өөр нэршлээр)
    func medInfo(_ name: String) -> (unit: String, price: Double) {
        let k = medKey(name)
        let cat = config.recs("medCatalog").filter { !$0.b("deleted") }
        let hit = cat.first { medKey($0.s("name")) == k }
            ?? cat.first { ($0["aliases"] as? [Any] ?? []).contains { medKey("\($0)") == k } }
        return (hit?.s("unit") ?? "", hit?.d("price") ?? 0)
    }
    func newMedLine(_ name: String) -> MedLine {
        let info = medInfo(name)
        return MedLine(name: name, qty: "1", unit: info.unit, unitPrice: info.price, price: String(Int64(info.price.rounded())))
    }
    /// Вэбийн courseItemsFor() + courseLoggedOn(): өнөөдөр идэвхтэй, хараахан бичигдээгүй курсийн эмийн мөрүүд
    func courseLines(for inp: Inp, date: String) -> [MedLine] {
        let logged = Set(inp.logs.filter { $0.s("date").hasPrefix(date) }.flatMap { $0.recs("meds") }.map { $0.s("courseId") })
        var out: [MedLine] = []
        for c in inp.raw.recs("course") where !c.b("deleted") {
            let start = c.s("start")
            if start.isEmpty { continue }
            let days = max(1, Int(c.d("days")))
            var last = Day.add(start, days: days - 1)
            let stopped = c.s("stopped")
            if !stopped.isEmpty && stopped < last { last = stopped }
            if date < start || date > last { continue }
            if logged.contains(c.s("id")) { continue }
            let med = c.s("med")
            let info = medInfo(med)
            let perDay = max(1, Int(c.d("perDay")))
            let dose = c.d("dose")
            let unit = c.s("unit").isEmpty ? info.unit : c.s("unit")
            let up = (c["unitPrice"] == nil || c["unitPrice"] is NSNull || c.s("unitPrice").isEmpty) ? info.price : c.d("unitPrice")
            let qty = (dose * Double(perDay) * 100).rounded() / 100
            let n = min(Day.between(start, date) + 1, days)
            var note = MedLine.qtyText(dose) + " " + unit + " × " + String(perDay) + "/өдөр · " + String(n) + "/" + String(days) + " хоног"
            if !c.s("note").isEmpty { note += " · " + c.s("note") }
            var line = MedLine(name: med, qty: MedLine.qtyText(qty), unit: unit, unitPrice: up, price: String(Int64((qty * up).rounded())), note: note)
            line.course = ["courseId": c.s("id"), "dose": dose, "perDay": Double(perDay)]
            out.append(line)
        }
        return out
    }
    private func isLabService(_ name: String) -> Bool {
        if strings("labSvcOff").contains(name) { return false }
        if strings("labSvcOn").contains(name) { return true }
        return name.lowercased().contains("шинжилгээ")
    }
    /// Вэбийн isDxApproverName(): онош батлах эрхтэй хэрэглэгч үү
    private func isApprover(_ name: String) -> Bool {
        guard !name.isEmpty, let u = users.first(where: { $0.s("name") == name }) else { return false }
        if let flag = u["dxApprove"] as? Bool { return flag }
        return u.s("role") == "Ахлах эмч"
    }
    /// Вэбийн nextExamNum(): тохиргооны эхлэх дугаар ба сүүлийн дугааруудаас +1
    private func nextExamNum() -> String {
        let cfg = config.rec("examNumCfg") ?? [:]
        let start = cfg["start"] == nil ? 90310 : Int(cfg.d("start"))
        let pad = cfg["pad"] == nil ? 6 : Int(cfg.d("pad"))
        let prefix = cfg.s("prefix")
        var maxNum = start
        func consider(_ r: Rec) {
            if r.s("kind") == "planned" { return }
            let digits = r.s("examNum").filter { $0.isNumber }
            guard let v = Int(digits), v >= start, v <= start + 100000 else { return }
            maxNum = max(maxNum, v)
        }
        recentExamNums.forEach(consider)
        monthExams.forEach { consider($0.raw) }
        waiting.forEach { consider($0.raw) }
        let n = String(maxNum + 1)
        return prefix + String(repeating: "0", count: max(0, pad - n.count)) + n
    }

    struct ExamDraft {
        var assistDocId = ""
        var temp = "", pulse = "", resp = "", weight = ""
        var diagnosis = "", note = ""
        var symptoms: [String] = []
        var services: [String] = []
        var meds: [String] = []
        var medNotes: [String: String] = [:]
    }

    /// Үзлэг дуусгах — вэбийн finishExam()-тай ижил бичлэгүүдийг НЭГ багцаар бичнэ:
    /// үзлэг + нэхэмжлэх + шинжилгээний захиалга + лог үүсгэж, хүлээлтээс хасаж, эмчийн тоог нэмнэ.
    /// Хүлээлтийн бичлэг аль хэдийн алга бол (өөр эмч үзсэн) багц бүхэлдээ цуцлагдана.
    func finishExam(_ w: Wait, draft: ExamDraft, admit: Bool = false) async -> Exam? {
        guard let meDoc = me else { errorText = "Таны хэрэглэгч эмчийн бүртгэлтэй холбогдоогүй байна"; return nil }
        let now = Day.nowMs
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "HH:mm"
        let assist = doctors.first { $0.s("id") == draft.assistDocId }
        let svc: [Rec] = draft.services.map { ["name": $0, "price": price(of: $0)] }
        let total = svc.reduce(0) { $0 + $1.d("price") }
        let meds: [Rec] = draft.meds.map { ["name": $0, "note": draft.medNotes[$0] ?? ""] }
        let regMs = w.raw.d("ms")
        let examNum = w.examNum.isEmpty ? nextExamNum() : w.examNum
        let stamp: Rec = ["_updatedAt": now, "_writer": deviceId]

        let noValue: Any = NSNull()
        let regValue: Any = regMs > 0 ? regMs : noValue
        let minutes: Double = max(0, ((now - regMs) / 60000).rounded())
        let durValue: Any = regMs > 0 ? minutes : noValue
        let noImages: [Any] = []
        var exam: Rec = [
            "id": Day.uid(), "horseId": w.raw.s("horseId"), "horse": w.horse, "owner": w.owner, "phone": w.phone,
            "docId": meDoc.s("id"), "docName": meDoc.s("name"),
            "assistDocId": draft.assistDocId, "assistDocName": assist?.s("name") ?? "",
            "date": Day.today, "time": f.string(from: Date()), "examNum": examNum
        ]
        exam["diagnosis"] = draft.diagnosis
        exam["note"] = draft.note
        exam["services"] = svc
        exam["meds"] = meds
        exam["symptoms"] = draft.symptoms
        exam["anamnesis"] = w.symptoms
        exam["temp"] = draft.temp
        exam["pulse"] = draft.pulse
        exam["resp"] = draft.resp
        exam["wt"] = draft.weight
        exam["province"] = w.raw.s("province")
        exam["soum"] = w.raw.s("soum")
        exam["images"] = noImages
        exam["amount"] = total
        exam["regMs"] = regValue
        exam["doneMs"] = now
        exam["durationMin"] = durValue
        exam["ms"] = now
        exam["src"] = "ios"
        if admit { exam["inpatient"] = true }
        // Онош батлах: үндсэн / хамтрагч эмч нь батлах эрхтэй бол автоматаар батлагдана
        let approver = [exam.s("docName"), exam.s("assistDocName")].first { isApprover($0) } ?? ""
        if !approver.isEmpty {
            exam["dxStatus"] = "approved"; exam["dxApprovedBy"] = approver; exam["dxApprovedMs"] = now; exam["dxAuto"] = true
            let h: Rec = ["ms": now, "by": userName, "action": "auto", "text": draft.diagnosis]
            exam["dxHistory"] = [h]
        } else {
            exam["dxStatus"] = "pending"; exam["dxSubmittedMs"] = now
            let h: Rec = ["ms": now, "by": userName, "action": "submit", "text": draft.diagnosis]
            exam["dxHistory"] = [h]
        }
        let examId = exam.s("id")

        let fin: Rec = [
            "id": Day.uid(), "examId": examId, "examNum": examNum, "horse": w.horse, "owner": w.owner, "phone": w.phone,
            "docName": exam.s("docName"), "amount": total, "services": draft.services.joined(separator: ", "),
            "paid": false, "method": "", "date": Day.today, "paidDate": "", "paidMs": 0, "ms": now
        ]
        let labHistory: Rec = ["status": "ordered", "ms": now, "user": userName, "note": "Үзлэгээс автоматаар үүссэн"]
        var labs: [Rec] = []
        for name in draft.services where isLabService(name) {
            var l: Rec = [
                "id": Day.uid(), "examId": examId, "examNum": examNum, "horseId": exam.s("horseId"), "horse": w.horse,
                "owner": w.owner, "phone": w.phone, "docId": exam.s("docId"), "docName": exam.s("docName")
            ]
            l["service"] = name
            l["price"] = price(of: name)
            l["diagnosis"] = draft.diagnosis
            l["date"] = Day.today
            l["status"] = "ordered"
            l["history"] = [labHistory]
            l["results"] = noImages
            l["resultNote"] = ""
            l["orderedMs"] = now
            l["doneMs"] = 0
            l["ms"] = now
            labs.append(l)
        }
        // Байрлан эмчлүүлэхэд оруулах бол нэхэмжлэхийн оронд байрлан эмчилгээний бичлэг үүснэ (вэбийн moveToInpatient)
        var inp: Rec = [
            "id": Day.uid(), "examId": examId, "horseId": exam.s("horseId"), "horse": w.horse, "owner": w.owner, "phone": w.phone,
            "diagnosis": draft.diagnosis, "examNum": examNum, "docId": exam.s("docId"), "docName": exam.s("docName")
        ]
        inp["location"] = ""
        inp["admittedMs"] = now
        inp["admittedDate"] = Day.today
        inp["admittedBy"] = userName
        inp["initialAmount"] = total
        inp["services"] = svc
        inp["meds"] = meds
        inp["log"] = noImages
        inp["discharged"] = false
        inp["ms"] = now
        let log: Rec = [
            "id": "log_" + String(Int64(now)) + "_" + String(Day.uid().suffix(4)), "user_name": userName, "user_role": role,
            "action": admit ? "Байрлан эмчилгээнд байрлуулав" : "Үзлэг дуусгасан", "target_id": admit ? inp.s("id") : examId, "target_name": w.horse + " — " + exam.s("docName"),
            "exam_id": examNum, "details": "Онош: " + draft.diagnosis + " · утасны аппаас", "log_date": Day.today, "log_ms": now
        ]

        func create(_ col: String, _ r: Rec) async -> [String: Any] {
            ["update": ["name": await fs.docName(col, r.s("id")), "fields": FSValue.encodeFields(r.merging(stamp) { a, _ in a })],
             "currentDocument": ["exists": false]]
        }
        var writes: [[String: Any]] = []
        // 1) Хүлээлтээс хасна — бичлэг байхгүй бол (өөр эмч үзчихсэн) бүх багц цуцлагдана
        writes.append(["delete": await fs.docName("waiting", w.id), "currentDocument": ["exists": true]])
        writes.append(await create("exams", exam))
        writes.append(await create(admit ? "inps" : "fins", admit ? inp : fin))
        for l in labs { writes.append(await create("labs", l)) }
        writes.append(await create("logs", log))
        // Эмчийн үзлэгийн тоо, орлогыг серверийн талд нэмнэ (зэрэг бичихэд алдагдахгүй).
        // Вэбтэй ижил: байрлан эмчлүүлэхэд оруулах үед тоолохгүй.
        if !admit { writes.append([
            "update": ["name": await fs.docName("doctors", meDoc.s("id")), "fields": FSValue.encodeFields(stamp)],
            "updateMask": ["fieldPaths": ["_updatedAt", "_writer"]],
            "updateTransforms": [
                ["fieldPath": "exams", "increment": ["integerValue": "1"]],
                ["fieldPath": "rev", "increment": ["integerValue": String(Int64(total))]]
            ]
        ]) }
        do {
            try await fs.commit(writes)
        } catch let e as FSError where e.isPermanent {
            errorText = "Үзлэг хадгалагдсангүй. Энэ адууг өөр эмч аль хэдийн үзсэн байж магадгүй — хүлээлтийг шинэчилнэ үү. (\(e.localizedDescription))"
            return nil
        } catch {
            errorText = "Үзлэг хадгалагдсангүй — сүлжээгээ шалгаад дахин дарна уу. (\(error.localizedDescription))"
            return nil
        }
        errorText = nil
        waiting.removeAll { $0.id == w.id }
        let saved = Exam(exam)
        if let e = saved { monthExams.insert(e, at: 0) }
        Task { await refresh() }
        return saved
    }

    // ── Жижүүрийн мэдээ, ээлж хүлээлцэх ──
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
    /// Ээлж хүлээлцэх актыг хадгална; send=true бол хүлээн авах эмчид илгээнэ
    func saveAct(items: Rec, total: Int, note: String, toDocId: String, toName: String, send: Bool) async -> Bool {
        let now = Day.nowMs
        var data: Rec = ["id": "\(Day.today)_\(myDocId)", "date": Day.today, "docId": myDocId, "docName": userName, "ms": now]
        let act: Rec = ["form": "МК01-М-060", "items": items, "total": total, "note": note, "savedMs": now]
        data["act"] = act
        var mask = ["id", "date", "docId", "docName", "ms", "act"]
        if send {
            let h: Rec = ["toDocId": toDocId, "toName": toName, "note": note, "sentMs": now, "acceptedMs": 0, "acceptNote": "", "inpCount": total]
            data["handover"] = h
            mask.append("handover")
        }
        return await saveDuty(id: data.s("id"), data: data, mask: mask)
    }
    func acceptHandover(_ d: Duty, note: String) async -> Bool {
        let now = Day.nowMs
        let h: Rec = ["acceptedMs": now, "acceptNote": note, "acceptedBy": userName]
        return await saveDuty(id: d.id, data: ["ms": now, "handover": h],
                              mask: ["ms", "handover.acceptedMs", "handover.acceptNote", "handover.acceptedBy"])
    }
    /// Ахлах эмч (онош батлах эрхтэй хэрэглэгч) актыг хянасан гэж тэмдэглэнэ
    var canReviewActs: Bool { isApprover(userName) }
    func reviewAct(_ d: Duty) async -> Bool {
        let now = Day.nowMs
        let r: Rec = ["by": userName, "ms": now]
        return await saveDuty(id: d.id, data: ["ms": now, "review": r], mask: ["ms", "review"])
    }

    // ── Мэдэгдлийн төхөөрөмж бүртгэх ──
    func registerDevice() async {
        guard loggedIn, let token = UserDefaults.standard.string(forKey: "apns_token"), !token.isEmpty else { return }
        let rec: Rec = [
            "id": deviceId, "token": token, "env": Config.apnsEnv, "platform": "ios",
            "user": userName, "docId": myDocId, "role": role,
            "model": UIDevice.current.model, "mute": Array(muted).sorted(), "ms": Day.nowMs
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
        templates = read("templates.json")
        if let d = try? Data(contentsOf: avatarURL) { avatar = UIImage(data: d) }
        schedule = read("schedule.json").first ?? [:]
        config = read("config.json").first ?? [:]
        staffToday = read("staffToday.json").first ?? [:]
        monthExams = read("exams.json").compactMap { Exam($0) }
        duties = read("duty.json").compactMap { Duty($0) }
        waiting = read("waiting.json").compactMap { Wait($0) }
        labs = read("labs.json").compactMap { Lab($0) }
        inps = applyPending(read("inps.json").compactMap { Inp($0) })
    }
}
