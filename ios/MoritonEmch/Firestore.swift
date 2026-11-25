import Foundation

// Firestore-ийг REST-ээр дуудна — гадны сан (SDK) хэрэггүй тул апп хурдан бүтээгдэж, жижиг байна.

enum FSError: LocalizedError {
    case http(Int, String)
    case bad

    var errorDescription: String? {
        switch self {
        case .http(let code, let body): return "Сервер \(code): \(body)"
        case .bad: return "Серверийн хариу буруу"
        }
    }
    /// Дахин оролдоод нэмэргүй алдаа (бичлэг байхгүй, хүсэлт буруу)
    var isPermanent: Bool {
        if case .http(let code, _) = self { return code == 400 || code == 404 || code == 409 }
        return false
    }
}

enum FSValue {
    static func decode(_ v: Any) -> Any {
        guard let m = v as? [String: Any] else { return NSNull() }
        if let x = m["stringValue"] as? String { return x }
        if let x = m["integerValue"] { return Double("\(x)") ?? 0 }
        if let x = m["doubleValue"] {
            if let n = x as? Double { return n }
            return Double("\(x)") ?? 0
        }
        if let x = m["booleanValue"] as? Bool { return x }
        if let x = m["timestampValue"] as? String { return x }
        if let x = m["mapValue"] as? [String: Any] { return decodeFields(x["fields"] as? [String: Any] ?? [:]) }
        if let x = m["arrayValue"] as? [String: Any] { return (x["values"] as? [Any] ?? []).map { decode($0) } }
        return NSNull()
    }
    static func decodeFields(_ f: [String: Any]) -> Rec {
        var out = Rec()
        for (k, v) in f { out[k] = decode(v) }
        return out
    }
    static func encode(_ v: Any) -> [String: Any] {
        if let x = v as? String { return ["stringValue": x] }
        if type(of: v) == Bool.self, let x = v as? Bool { return ["booleanValue": x] }
        if let x = v as? Int { return ["integerValue": String(x)] }
        if let x = v as? Int64 { return ["integerValue": String(x)] }
        if let x = v as? Double {
            if x == x.rounded() && abs(x) < 9e15 { return ["integerValue": String(Int64(x))] }
            return ["doubleValue": x]
        }
        if let x = v as? [Any] { return ["arrayValue": ["values": x.map { encode($0) }]] }
        if let x = v as? Rec { return ["mapValue": ["fields": encodeFields(x)]] }
        return ["nullValue": NSNull()]
    }
    static func encodeFields(_ r: Rec) -> [String: Any] {
        var out = [String: Any]()
        for (k, v) in r { out[k] = encode(v) }
        return out
    }
}

actor FirestoreClient {
    static let shared = FirestoreClient()

    private var idToken: String?
    private var expiry = Date.distantPast
    private let root = "projects/\(Config.projectId)/databases/(default)/documents"
    private var base: String { "https://firestore.googleapis.com/v1/" + root }

    // ── Нэвтрэлт (вэбтэй ижил: Firebase Anonymous) ──
    private func token() async throws -> String {
        if let t = idToken, Date() < expiry { return t }
        let defaults = UserDefaults.standard
        if let rt = defaults.string(forKey: "fb_refresh"), !rt.isEmpty {
            var req = URLRequest(url: URL(string: "https://securetoken.googleapis.com/v1/token?key=\(Config.apiKey)")!)
            req.httpMethod = "POST"
            req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
            req.httpBody = Data("grant_type=refresh_token&refresh_token=\(rt)".utf8)
            if let j = try? await raw(req) as? [String: Any], let t = j["id_token"] as? String {
                remember(t, refresh: j["refresh_token"] as? String, expiresIn: j["expires_in"])
                return t
            }
        }
        var req = URLRequest(url: URL(string: "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=\(Config.apiKey)")!)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["returnSecureToken": true])
        guard let j = try await raw(req) as? [String: Any], let t = j["idToken"] as? String else { throw FSError.bad }
        remember(t, refresh: j["refreshToken"] as? String, expiresIn: j["expiresIn"])
        return t
    }

    private func remember(_ t: String, refresh: String?, expiresIn: Any?) {
        idToken = t
        let secs = Double("\(expiresIn ?? "3600")") ?? 3600
        expiry = Date().addingTimeInterval(max(60, secs - 300))
        if let r = refresh, !r.isEmpty { UserDefaults.standard.set(r, forKey: "fb_refresh") }
    }

    private func raw(_ req: URLRequest) async throws -> Any {
        var r = req
        r.timeoutInterval = 25
        let (data, resp) = try await URLSession.shared.data(for: r)
        let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(code) else {
            throw FSError.http(code, String(String(data: data, encoding: .utf8)?.prefix(300) ?? ""))
        }
        if data.isEmpty { return [String: Any]() }
        return try JSONSerialization.jsonObject(with: data)
    }

    private func call(_ method: String, _ url: String, body: Any? = nil) async throws -> Any {
        guard let u = URL(string: url) else { throw FSError.bad }
        var req = URLRequest(url: u)
        req.httpMethod = method
        req.setValue("Bearer \(try await token())", forHTTPHeaderField: "Authorization")
        if let b = body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONSerialization.data(withJSONObject: b)
        }
        return try await raw(req)
    }

    // ── Унших ──
    /// Collection-ийн бүх бичлэг (хуудаслаж татна)
    func list(_ col: String) async throws -> [Rec] {
        var out = [Rec]()
        var page: String? = nil
        repeat {
            var url = "\(base)/\(col)?pageSize=300"
            if let p = page, let enc = p.addingPercentEncoding(withAllowedCharacters: .alphanumerics) { url += "&pageToken=\(enc)" }
            guard let j = try await call("GET", url) as? [String: Any] else { throw FSError.bad }
            for d in (j["documents"] as? [[String: Any]] ?? []) {
                out.append(FSValue.decodeFields(d["fields"] as? [String: Any] ?? [:]))
            }
            page = j["nextPageToken"] as? String
        } while page != nil
        return out
    }

    /// Сүүлийн N бичлэг (ms талбараар)
    func recent(_ col: String, limit: Int) async throws -> [Rec] {
        let q: [String: Any] = ["structuredQuery": [
            "from": [["collectionId": col]],
            "orderBy": [["field": ["fieldPath": "ms"], "direction": "DESCENDING"]],
            "limit": limit
        ]]
        guard let arr = try await call("POST", "\(base):runQuery", body: q) as? [[String: Any]] else { throw FSError.bad }
        return arr.compactMap { row in
            guard let d = row["document"] as? [String: Any] else { return nil }
            return FSValue.decodeFields(d["fields"] as? [String: Any] ?? [:])
        }
    }

    // ── Бичих ──
    /// Байрлагчийн өдрийн бичлэг нэмэх. Бичлэгийг БҮТНЭЭР нь дарж бичихгүй —
    /// зөвхөн log массивт нэмж, ms/_updatedAt/_writer-ийг шинэчилнэ (бусад талбарт хүрэхгүй).
    func appendLog(inpId: String, log: Rec, writer: String) async throws {
        let now = Day.nowMs
        let write: [String: Any] = [
            "update": [
                "name": "\(root)/inps/\(inpId)",
                "fields": FSValue.encodeFields(["ms": now, "_updatedAt": now, "_writer": writer])
            ],
            "updateMask": ["fieldPaths": ["ms", "_updatedAt", "_writer"]],
            "updateTransforms": [[
                "fieldPath": "log",
                "appendMissingElements": ["values": [FSValue.encode(log)]]
            ]],
            "currentDocument": ["exists": true]
        ]
        _ = try await call("POST", "\(base):commit", body: ["writes": [write]])
    }

    /// Нэг бичлэгийг бүтнээр хадгалах (төхөөрөмжийн мэдэгдлийн токен г.м.)
    func set(_ col: String, id: String, data: Rec) async throws {
        _ = try await call("PATCH", "\(base)/\(col)/\(id)", body: ["fields": FSValue.encodeFields(data)])
    }
}
