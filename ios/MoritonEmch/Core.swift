import Foundation
import SwiftUI
import CryptoKit

// ── Тохиргоо ─────────────────────────────────────────────────
enum Config {
    static let projectId = "moriton-4ecc0"
    static let apiKey = "AIzaSyCB20uvd_XsWju91IERQGs6yGFYSBSUx10"   // вэбийн firebase.js-тэй ижил (нууц биш)
    static let pwSalt = "moriton_salt_2026"                          // вэбийн _hashPassword-тай ижил
    static let version = "0.8"
    static let bucket = "moriton-4ecc0.firebasestorage.app"
    #if DEBUG
    static let apnsEnv = "sandbox"      // Xcode-оор суулгасан хувилбар
    #else
    static let apnsEnv = "production"   // TestFlight / App Store
    #endif
}

// ── Өнгө ─────────────────────────────────────────────────────
extension Color {
    init(hex: UInt32) {
        self.init(red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255)
    }
    static let navy = Color(hex: 0x022438)
    static let navy2 = Color(hex: 0x14445E)
    static let gold = Color(hex: 0xC9A75A)
    static let ground = Color(hex: 0xF6F5F0)
    static let line = Color(hex: 0xE6E3D8)
    static let ink = Color(hex: 0x10222E)
    static let mute = Color(hex: 0x5A6B76)
    static let okBg = Color(hex: 0xE3F1E8)
    static let okFg = Color(hex: 0x14602F)
    static let warnBg = Color(hex: 0xFBEBD3)
    static let warnFg = Color(hex: 0x7A4A05)
}

// ── Уян хатан бичлэг (Firestore-ийн талбарын төрөл холимог байдаг) ──
typealias Rec = [String: Any]

extension Dictionary where Key == String, Value == Any {
    func s(_ k: String) -> String {
        guard let v = self[k] else { return "" }
        if let x = v as? String { return x }
        if let x = v as? Double {
            return x == x.rounded() && abs(x) < 1e15 ? String(Int64(x)) : String(x)
        }
        if let x = v as? Int { return String(x) }
        return ""
    }
    func d(_ k: String) -> Double {
        guard let v = self[k] else { return 0 }
        if let x = v as? Double { return x }
        if let x = v as? Int { return Double(x) }
        if let x = v as? String { return Double(x) ?? 0 }
        return 0
    }
    func b(_ k: String) -> Bool {
        guard let v = self[k] else { return false }
        if let x = v as? Bool { return x }
        if let x = v as? String { return x == "true" }
        return false
    }
    func rec(_ k: String) -> Rec? { self[k] as? Rec }
    func recs(_ k: String) -> [Rec] { (self[k] as? [Any])?.compactMap { $0 as? Rec } ?? [] }
}

// ── Огноо ────────────────────────────────────────────────────
enum Day {
    static func str(_ date: Date = Date()) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }
    static var today: String { str() }
    static var pretty: String {
        let names = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"]
        let wd = Calendar.current.component(.weekday, from: Date())
        return today.replacingOccurrences(of: "-", with: ".") + " · " + names[(wd - 1) % 7]
    }
    static var greeting: String {
        let h = Calendar.current.component(.hour, from: Date())
        return h < 11 ? "Өглөөний мэнд" : (h < 18 ? "Өдрийн мэнд" : "Оройн мэнд")
    }
    static func add(_ date: String, days: Int) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        guard let d = f.date(from: date), let r = Calendar(identifier: .gregorian).date(byAdding: .day, value: days, to: d) else { return date }
        return f.string(from: r)
    }
    static func between(_ from: String, _ to: String) -> Int {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        guard let a = f.date(from: from), let b = f.date(from: to) else { return 0 }
        return Calendar(identifier: .gregorian).dateComponents([.day], from: a, to: b).day ?? 0
    }
    static var nowMs: Double { (Date().timeIntervalSince1970 * 1000).rounded() }
    /// Вэбийн inpatientDays()-тай ижил: орсон өдөр = 1, өдөр бүрийн 12:00-оос хойш +1
    static func inpatientDays(admittedMs: Double) -> Int {
        guard admittedMs > 0 else { return 1 }
        let cal = Calendar.current
        let now = Date()
        let adm = cal.startOfDay(for: Date(timeIntervalSince1970: admittedMs / 1000))
        let cur = cal.startOfDay(for: now)
        let diff = cal.dateComponents([.day], from: adm, to: cur).day ?? 0
        var days = 1 + diff
        if cal.component(.hour, from: now) < 12 && diff > 0 { days -= 1 }
        return max(1, days)
    }
    static func uid() -> String {
        let ms = Int64(Date().timeIntervalSince1970 * 1000)
        let chars = Array("abcdefghijklmnopqrstuvwxyz0123456789")
        let rnd = String((0..<5).map { _ in chars[Int.random(in: 0..<chars.count)] })
        return String(ms, radix: 36) + rnd
    }
}

enum Hash {
    static func password(_ pw: String) -> String {
        let digest = SHA256.hash(data: Data((pw + Config.pwSalt).utf8))
        return digest.map { String(format: "%02x", $0) }.joined()
    }
}

// ── Загварууд ────────────────────────────────────────────────
struct Inp: Identifiable {
    let id: String
    var raw: Rec

    init?(_ r: Rec) {
        let i = r.s("id")
        guard !i.isEmpty else { return nil }
        id = i
        raw = r
    }

    var horse: String { raw.s("horse") }
    var owner: String { raw.s("owner") }
    var phone: String { raw.s("phone") }
    var location: String { raw.s("location") }
    var diagnosis: String { raw.s("diagnosis") }
    var docId: String { raw.s("docId") }
    var docName: String { raw.s("docName") }
    var discharged: Bool { raw.b("discharged") }
    var admittedDate: String { raw.s("admittedDate") }
    var day: Int { Day.inpatientDays(admittedMs: raw.d("admittedMs")) }
    var logs: [Rec] { raw.recs("log") }
    var surgeryPending: Bool { !discharged && (raw.rec("surgery")?.b("pending") ?? false) }
    var surgeryDate: String { raw.rec("surgery")?.s("date") ?? "" }

    func assign(on date: String) -> Rec? {
        guard let a = raw.rec("assigns")?.rec(date), !a.s("docId").isEmpty else { return nil }
        return a
    }
    func inHospital(on date: String) -> Bool {
        if admittedDate.isEmpty || date < admittedDate { return false }
        if discharged {
            let out = raw.s("dischargedDate")
            return !out.isEmpty && date <= out
        }
        return date <= Day.today
    }
    func done(on date: String) -> Bool { logs.contains { $0.s("date").hasPrefix(date) } }
    var lastLog: Rec? {
        logs.max { a, b in
            let da = a.s("date"), db = b.s("date")
            return da == db ? a.d("ms") < b.d("ms") : da < db
        }
    }
    var lastLine: String {
        guard let l = lastLog else { return "" }
        func v(_ k: String) -> String { l.s(k).isEmpty ? "—" : l.s(k) }
        let date = String(l.s("date").dropFirst(5).prefix(5)).replacingOccurrences(of: "-", with: ".")
        return "Сүүлд: \(date) \(l.s("docName")) · T \(v("temp")) · P \(v("pulse")) · R \(v("resp"))"
    }
}

struct Wait: Identifiable {
    let id: String
    let raw: Rec
    init?(_ r: Rec) {
        let i = r.s("id")
        guard !i.isEmpty else { return nil }
        id = i
        raw = r
    }
    var horse: String { raw.s("horse") }
    var owner: String { raw.s("owner") }
    var phone: String { raw.s("phone") }
    var symptoms: String { raw.s("symptoms") }
    var examNum: String { raw.s("examNum") }
    var iabd: String { raw.s("iabd") }
    var examBy: String { raw.s("examBy") }
    /// Өөр хүн үзлэг эхлүүлээд 2 цагаас хэтрээгүй бол «явагдаж байна» гэж үзнэ
    var examActive: Bool { !examBy.isEmpty && Day.nowMs - raw.d("examByMs") < 2 * 3600 * 1000 }
    var isFieldTrip: Bool {
        guard let v = raw["plTrip"], !(v is NSNull) else { return false }
        if let b = v as? Bool { return b }
        return !raw.s("plTrip").isEmpty
    }
    var waited: String {
        let ms = raw.d("ms")
        guard ms > 0 else { return "" }
        let mins = max(0, Int((Day.nowMs - ms) / 60000))
        return mins < 60 ? "\(mins) мин" : "\(mins / 60) ц \(mins % 60) мин"
    }
}

struct Lab: Identifiable {
    let id: String
    let raw: Rec
    init?(_ r: Rec) {
        let i = r.s("id")
        guard !i.isEmpty else { return nil }
        id = i
        raw = r
    }
    var horse: String { raw.s("horse") }
    var owner: String { raw.s("owner") }
    var service: String { raw.s("service") }
    var docName: String { raw.s("docName") }
    var date: String { raw.s("date") }
    var status: String { raw.s("status") }
    var isDone: Bool { status == "done" }
    var isOpen: Bool { status != "done" && status != "cancelled" }
    var statusLabel: String {
        switch status {
        case "ordered": return "Захиалсан"
        case "collected": return "Сорьц авсан"
        case "sent": return "Төв рүү илгээсэн"
        case "received": return "Сорьц хүлээн авсан"
        case "done": return "Хариу гарсан"
        case "cancelled": return "Цуцалсан"
        default: return status
        }
    }
}

struct Exam: Identifiable {
    let id: String
    let raw: Rec
    init?(_ r: Rec) {
        let i = r.s("id")
        guard !i.isEmpty else { return nil }
        id = i
        raw = r
    }
    var horse: String { raw.s("horse") }
    var owner: String { raw.s("owner") }
    var date: String { raw.s("date") }
    var examNum: String { raw.s("examNum") }
    var diagnosis: String { raw.s("diagnosis") }
    var docName: String { raw.s("docName") }
    var assistDocName: String { raw.s("assistDocName") }
    var isPlanned: Bool { raw.s("kind") == "planned" }
    var imageCount: Int { (raw["images"] as? [Any])?.count ?? 0 }
    var images: [Rec] { raw.recs("images") }
    var phone: String { raw.s("phone") }
    var note: String { raw.s("note") }
    var anamnesis: String { raw.s("anamnesis") }
    var serviceNames: [String] { (raw["services"] as? [Any] ?? []).compactMap { ($0 as? Rec)?.s("name") ?? ($0 as? String) } }
    var meds: [Rec] { raw.recs("meds") }
    var symptoms: [String] { (raw["symptoms"] as? [Any] ?? []).compactMap { $0 as? String } }
    var dxLabel: String {
        switch raw.s("dxStatus") {
        case "approved": return "Онош батлагдсан"
        case "pending": return "Онош хянагдаж байна"
        case "returned": return "Онош буцаагдсан"
        default: return ""
        }
    }
}

enum Money {
    static func fmt(_ v: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.groupingSeparator = ","
        f.maximumFractionDigits = 0
        return (f.string(from: NSNumber(value: v)) ?? "0") + "₮"
    }
}

/// Вэбийн app.js-ээс үүсгэсэн үндсэн жагсаалтууд (ios/scripts/gen-catalog.js)
enum Catalog {
    private static let data: [String: Any] = {
        guard let url = Bundle.main.url(forResource: "catalog", withExtension: "json"),
              let d = try? Data(contentsOf: url),
              let j = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else { return [:] }
        return j
    }()
    private static func list(_ key: String) -> [String] { (data[key] as? [Any] ?? []).compactMap { $0 as? String } }
    static var services: [String] { list("services") }
    static var meds: [String] { list("meds") }
    static var symptoms: [String] { list("symptoms") }
    /// Вэбийн ROLE_DEFAULT_PAGES — дүр бүрийн анхдагч хуудасны эрх
    static var rolePages: [String: [String]] {
        var out: [String: [String]] = [:]
        for (role, v) in (data["rolePages"] as? [String: Any] ?? [:]) { out[role] = (v as? [Any] ?? []).compactMap { $0 as? String } }
        return out
    }
}

/// Жижүүрийн мэдээ + ээлж хүлээлцэх бичлэг (collection: duty, id = огноо_эмчийнID)
struct Duty: Identifiable {
    let id: String
    let raw: Rec
    init?(_ r: Rec) {
        let i = r.s("id")
        guard !i.isEmpty else { return nil }
        id = i
        raw = r
    }
    var date: String { raw.s("date") }
    var docId: String { raw.s("docId") }
    var docName: String { raw.s("docName") }
    var report: Rec { raw.rec("report") ?? [:] }
    var hasReport: Bool { raw.d("reportMs") > 0 }
    // Ээлж хүлээлцэх акт (МК01-М-060)
    var act: Rec { raw.rec("act") ?? [:] }
    var hasAct: Bool { raw.rec("act") != nil }
    var actItems: Rec { act.rec("items") ?? [:] }
    var filledCount: Int { actItems.count }
    var horseTotal: Int { Int(act.d("total")) }
    var reviewedBy: String { raw.rec("review")?.s("by") ?? "" }
    var reviewed: Bool { !reviewedBy.isEmpty }
    var statusLine: String {
        if !sent { return "Бөглөж байна — ээлж өгөөгүй" }
        if !accepted { return "Хүлээн аваагүй" }
        return reviewed ? "Хүлээн авсан · \(reviewedBy) хянасан" : "Хүлээн авсан · ахлах эмч хянаагүй"
    }
    var handover: Rec { raw.rec("handover") ?? [:] }
    var sent: Bool { handover.d("sentMs") > 0 }
    var accepted: Bool { handover.d("acceptedMs") > 0 }
    var toDocId: String { handover.s("toDocId") }
    var toName: String { handover.s("toName") }
}

enum Clock {
    static func time(_ ms: Double) -> String {
        guard ms > 0 else { return "" }
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "MM.dd HH:mm"
        return f.string(from: Date(timeIntervalSince1970: ms / 1000))
    }
}

/// Өдрийн эмчилгээний эмийн мөр (вэбийн INP_DRAFT.meds-тэй ижил талбарууд)
struct MedLine: Identifiable {
    let id = UUID()
    var name: String
    var qty: String = "1"
    var unit: String = ""
    var unitPrice: Double = 0
    var price: String = "0"
    var note: String = ""
    var manualPrice = false
    var course: Rec? = nil     // курсээс автоматаар орсон бол: courseId, dose, perDay

    var priceValue: Double { Double(price.replacingOccurrences(of: ",", with: ".")) ?? 0 }
    var qtyValue: Double { Double(qty.replacingOccurrences(of: ",", with: ".")) ?? 0 }
    var rec: Rec {
        var r: Rec = ["name": name, "note": note, "qty": qtyValue, "unit": unit, "unitPrice": unitPrice, "price": priceValue]
        if manualPrice { r["manualPrice"] = true }
        if let c = course {
            r["courseId"] = c.s("courseId")
            r["fromCourse"] = true
            r["dose"] = c.d("dose")
            r["perDay"] = c.d("perDay")
        }
        return r
    }
    static func qtyText(_ v: Double) -> String {
        let r = (v * 100).rounded() / 100
        return r == r.rounded() ? String(Int64(r)) : String(r)
    }
}

/// «Жижүүр эмчийн ээлж хүлээлцэх акт» (маягт МК01-М-060) — цаасан маягтын мөрүүд, дугаарлалт яг хэвээр
enum DutyForm {
    struct Item: Identifiable {
        let no: Int
        let group: String
        let title: String
        var numeric = false
        var quick: [String] = []
        var id: Int { no }
        var key: String { String(no) }
    }
    static let groups = ["Дэвтэр бөглөсөн эсэх", "Эмчилгээ, арчилгаа маллагаа", "БТТ хүлээлцэх", "Эд хэрэгсэл, цэвэрлэгээ", "Нийт адууны тоо", "Бусад"]
    private static let book = ["Бөглөсөн", "Бүртгэл хийсэн", "Бөглөөгүй"]
    private static let care = ["Хийсэн", "Зураг оруулсан", "Хийгээгүй"]
    private static let device = ["Цэвэр, цэнэгтэй", "Цэвэр", "Цэнэгтэй", "Ашиглаагүй"]
    private static let tools = ["Хэвийн", "Бүрэн", "Цэвэр", "Дутуу"]
    static let items: [Item] = [
        Item(no: 1, group: groups[0], title: "ХАБЭАД", quick: book),
        Item(no: 2, group: groups[0], title: "ЭАД", quick: book),
        Item(no: 3, group: groups[0], title: "ИАБД, ЯАБД", quick: book),
        Item(no: 4, group: groups[1], title: "Усалгаа өвсөлгөө хийгдсэн эсэх", quick: care),
        Item(no: 5, group: groups[1], title: "Хүнд адуунд хяналт тавьсан эсэх", quick: care),
        Item(no: 6, group: groups[1], title: "Цагийн тариа хийсэн эсэх", quick: care),
        Item(no: 7, group: groups[2], title: "Хээлийн эхо апп цэвэр, цэнэгтэй эсэх", quick: device),
        Item(no: 8, group: groups[2], title: "Хөлийн эхо апп цэвэр, цэнэгтэй эсэх", quick: device),
        Item(no: 9, group: groups[2], title: "Рентген аппарат цэвэр, цэнэгтэй эсэх", quick: device),
        Item(no: 10, group: groups[2], title: "Залгиур дуран апп цэвэр, цэнэгтэй эсэх", quick: device),
        Item(no: 12, group: groups[2], title: "Утлагын апп цэвэр, цэнэгтэй эсэх", quick: device),
        Item(no: 13, group: groups[2], title: "Шарлагын апп цэвэр, цэнэгтэй эсэх", quick: device),
        Item(no: 14, group: groups[2], title: "Шүдний багаж", quick: device),
        Item(no: 15, group: groups[2], title: "Зонд", quick: device),
        Item(no: 17, group: groups[3], title: "Утас цэнэг сүлжээ хэвийн эсэх", quick: ["Цэнэгтэй, хэвийн", "Хэвийн", "Цэнэггүй"]),
        Item(no: 18, group: groups[3], title: "Ногт, чөдөр", quick: tools),
        Item(no: 19, group: groups[3], title: "Нийт түлхүүр, станц бүрэн эсэх", quick: tools),
        Item(no: 20, group: groups[3], title: "Тэжээлийн сав цэвэр эсэх", quick: tools),
        Item(no: 21, group: groups[4], title: "Тусгаарлалт", numeric: true),
        Item(no: 22, group: groups[4], title: "Эмнэлэгт", numeric: true),
        Item(no: 23, group: groups[4], title: "Модон зүчээнд", numeric: true),
        Item(no: 24, group: groups[4], title: "Хойд саравчинд", numeric: true),
        Item(no: 25, group: groups[4], title: "Шинэ зүчээнд", numeric: true),
        Item(no: 26, group: groups[4], title: "Байгалийн зүчээнд", numeric: true),
        Item(no: 27, group: groups[4], title: "1-р нарлагааны хашаанд", numeric: true),
        Item(no: 28, group: groups[4], title: "2-р нарлагааны хашаанд", numeric: true),
        Item(no: 29, group: groups[4], title: "3-р нарлагааны хашаанд", numeric: true),
        Item(no: 30, group: groups[5], title: "Үзлэг системд бүртгэгдсэн эсэх", quick: ["Бүртгэгдсэн", "Дутуу"]),
        Item(no: 31, group: groups[5], title: "Өвс тэжээлийн зарцуулалтын тоо", quick: ["Өвс ", "Хивэг ", "Овъёос "]),
        Item(no: 32, group: groups[5], title: "Эмнэлгийн байр пайз зүүсэн эсэх", quick: ["Зүүсэн", "Дутуу"])
    ]
    /// Тоон мөрийн эхний тоог авна («26 3 даага 2 жил» → 26) — нийт адууны тоог бодоход
    static func leadingNumber(_ text: String) -> Int {
        Int(text.trimmingCharacters(in: .whitespaces).prefix { $0.isNumber }) ?? 0
    }
}
