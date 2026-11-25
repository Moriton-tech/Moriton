import Foundation
import SwiftUI
import CryptoKit

// ── Тохиргоо ─────────────────────────────────────────────────
enum Config {
    static let projectId = "moriton-4ecc0"
    static let apiKey = "AIzaSyCB20uvd_XsWju91IERQGs6yGFYSBSUx10"   // вэбийн firebase.js-тэй ижил (нууц биш)
    static let pwSalt = "moriton_salt_2026"                          // вэбийн _hashPassword-тай ижил
    static let version = "0.1"
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
