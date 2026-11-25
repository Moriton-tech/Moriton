import SwiftUI

// ── Жижиг хэсгүүд ────────────────────────────────────────────
struct Tag: View {
    let text: String
    var ok = false
    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 9).padding(.vertical, 4)
            .background(ok ? Color.okBg : Color.warnBg)
            .foregroundColor(ok ? Color.okFg : Color.warnFg)
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct Card<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    var body: some View {
        VStack(alignment: .leading, spacing: 8) { content }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.line))
            .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

struct OfflineBar: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        if !store.online || !store.pending.isEmpty {
            HStack(spacing: 8) {
                Image(systemName: store.online ? "arrow.triangle.2.circlepath" : "wifi.slash")
                Text(store.online
                     ? "\(store.pending.count) бичлэг илгээгдэж байна"
                     : (store.pending.isEmpty ? "Сүлжээгүй — хадгалсан хуулбараар ажиллаж байна"
                                              : "Сүлжээгүй. \(store.pending.count) бичлэг утсанд хадгалагдсан"))
                Spacer()
            }
            .font(.footnote)
            .padding(.horizontal, 16).padding(.vertical, 10)
            .background(Color.warnBg)
            .foregroundColor(Color.warnFg)
        }
    }
}

struct ErrorBar: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        if let e = store.errorText {
            Text(e)
                .font(.footnote)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16).padding(.vertical, 8)
                .background(Color(hex: 0xFBE3E1))
                .foregroundColor(Color(hex: 0x8A1F18))
        }
    }
}

struct EmptyNote: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.subheadline)
            .foregroundColor(Color.mute)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 28)
    }
}

/// Дэлгэц бүрийн нийтлэг хүрээ: төлөвийн мөр + татаж шинэчлэх
struct Screen<Content: View>: View {
    @EnvironmentObject var store: AppStore
    let title: String
    let content: Content
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                OfflineBar()
                ErrorBar()
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) { content }
                        .padding(16)
                }
                .refreshable { await store.refresh() }
            }
            .background(Color.ground)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// ── Нэвтрэх ──────────────────────────────────────────────────
struct LoginView: View {
    @EnvironmentObject var store: AppStore
    @State private var name = ""
    @State private var password = ""
    @State private var wrong = false

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Text("Морьтон Эмч").font(.largeTitle.bold()).foregroundColor(.white)
            Text("Адууны эмнэлгийн систем").font(.subheadline).foregroundColor(.white.opacity(0.7))
            VStack(spacing: 12) {
                if store.users.isEmpty {
                    if store.loading { ProgressView().tint(Color.navy) }
                    Text(store.errorText ?? (store.online ? "Хэрэглэгчийн жагсаалт татаж байна…" : "Анх нэвтрэхэд сүлжээ хэрэгтэй"))
                        .font(.footnote).foregroundColor(Color.mute).multilineTextAlignment(.center)
                    Button("Дахин оролдох") { Task { await store.refresh() } }
                } else {
                    Picker("Хэрэглэгч", selection: $name) {
                        Text("Хэрэглэгч сонгох").tag("")
                        ForEach(store.users.map { $0.s("name") }.sorted(), id: \.self) { n in
                            Text(n).tag(n)
                        }
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(Color.ground)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    SecureField("Нууц үг", text: $password)
                        .textContentType(.password)
                        .padding(.horizontal, 12)
                        .frame(minHeight: 48)
                        .background(Color.ground)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    if wrong {
                        Text("Нэр эсвэл нууц үг буруу").font(.footnote).foregroundColor(.red)
                    }
                    Button {
                        wrong = !store.login(name: name, password: password)
                    } label: {
                        Text("Нэвтрэх").font(.headline).frame(maxWidth: .infinity, minHeight: 50)
                    }
                    .background(Color.navy)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .disabled(name.isEmpty || password.isEmpty)
                }
            }
            .padding(18)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 18))
            Spacer()
            Text("v\(Config.version)").font(.caption).foregroundColor(.white.opacity(0.5))
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.navy.ignoresSafeArea())
    }
}

// ── Миний ажил ───────────────────────────────────────────────
struct MyWorkView: View {
    @EnvironmentObject var store: AppStore
    @State private var writing: Inp?

    var body: some View {
        let tasks = store.myTasks
        let done = tasks.filter { $0.done(on: Day.today) }.count
        Screen(title: "Миний ажил") {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("\(Day.greeting), \(store.userName)").font(.title3.bold()).foregroundColor(.white)
                        Text(Day.pretty).font(.footnote).foregroundColor(.white.opacity(0.7))
                    }
                    Spacer()
                    if !tasks.isEmpty {
                        VStack(alignment: .trailing, spacing: 0) {
                            Text("\(done)/\(tasks.count)").font(.title2.bold().monospacedDigit()).foregroundColor(Color.gold)
                            Text("даалгавар").font(.caption2).foregroundColor(.white.opacity(0.7))
                        }
                    }
                }
                if !tasks.isEmpty {
                    ProgressView(value: Double(done), total: Double(tasks.count)).tint(Color.gold)
                }
            }
            .padding(16)
            .background(Color.navy)
            .clipShape(RoundedRectangle(cornerRadius: 14))

            DutySection()

            if store.me == nil {
                EmptyNote(text: "«\(store.userName)» хэрэглэгч эмчийн бүртгэлтэй холбогдоогүй байна. Вэб дээр: Тохиргоо → Эмч нар.")
            }

            Text("Өнөөдрийн даалгавар").font(.subheadline.bold()).padding(.top, 4)
            if tasks.isEmpty {
                EmptyNote(text: "Өнөөдөр танд хуваарилсан адуу алга")
            }
            ForEach(tasks) { i in
                InpCard(inp: i, showTask: true) { writing = i }
            }

            let others = store.myOthers
            if !others.isEmpty {
                Text("Миний эмчилж буй бусад адуу").font(.subheadline.bold()).padding(.top, 8)
                ForEach(others) { i in
                    InpCard(inp: i, showTask: false) { writing = i }
                }
            }

            MyExamsSection()
        }
        .sheet(item: $writing) { i in TreatSheet(inp: i) }
    }
}

struct InpCard: View {
    let inp: Inp
    let showTask: Bool
    let onWrite: () -> Void

    var body: some View {
        let today = Day.today
        let done = inp.done(on: today)
        Card {
            HStack {
                Text(inp.horse).font(.headline)
                Spacer()
                Tag(text: done ? "Бичсэн" : "Хийгээгүй", ok: done)
            }
            Text("\(inp.location.isEmpty ? "байрлалгүй" : inp.location) · \(inp.day) дахь хоног · \(inp.owner)")
                .font(.footnote).foregroundColor(Color.mute)
            if !inp.diagnosis.isEmpty { Text(inp.diagnosis).font(.subheadline) }
            if inp.surgeryPending {
                Text("Мэс засалд хүлээгдэж буй\(inp.surgeryDate.isEmpty ? "" : " · " + inp.surgeryDate)")
                    .font(.footnote.weight(.semibold)).foregroundColor(Color.warnFg)
            }
            if showTask, let task = inp.assign(on: today)?.s("task"), !task.isEmpty {
                Text("Даалгавар: \(task)")
                    .font(.footnote)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(hex: 0xF1EFE6))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            if !inp.lastLine.isEmpty {
                Text(inp.lastLine).font(.caption).foregroundColor(Color.mute)
            }
            HStack(spacing: 8) {
                Button(action: onWrite) {
                    Text(done ? "Дахин бичлэг нэмэх" : "Эмчилгээ бичих")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: 46)
                }
                .background(Color.navy)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                let examId = inp.raw.s("examId")
                PhotoButton(target: PhotoTarget(col: examId.isEmpty ? "inps" : "exams", id: examId.isEmpty ? inp.id : examId, horse: inp.horse),
                            count: examId.isEmpty ? ((inp.raw["images"] as? [Any])?.count ?? 0) : 0)
                let digits = inp.phone.filter { $0.isNumber || $0 == "+" }
                if !digits.isEmpty, let url = URL(string: "tel:\(digits)") {
                    Link(destination: url) {
                        Image(systemName: "phone")
                            .frame(width: 46, height: 46)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.navy))
                    }
                    .accessibilityLabel("Эзэнд залгах")
                }
            }
        }
    }
}

// ── Эмчилгээ бичих ───────────────────────────────────────────
struct TreatSheet: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let inp: Inp
    @State private var temp = ""
    @State private var pulse = ""
    @State private var resp = ""
    @State private var weight = ""
    @State private var slot = ""
    @State private var note = ""

    private var canSave: Bool {
        !note.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !temp.isEmpty || !pulse.isEmpty || !resp.isEmpty
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("\(inp.location.isEmpty ? "байрлалгүй" : inp.location) · \(inp.day) дахь хоног")
                        .font(.footnote).foregroundColor(Color.mute)
                    if !inp.lastLine.isEmpty { Text(inp.lastLine).font(.footnote).foregroundColor(Color.mute) }
                }
                Section("Үзүүлэлт") {
                    vital("Темп °C", "38.0", $temp, .decimalPad)
                    vital("Зүрхний цохилт", "40", $pulse, .numberPad)
                    vital("Амьсгал /мин", "12", $resp, .numberPad)
                    vital("Жин кг", "", $weight, .decimalPad)
                }
                Section("Цаг") {
                    Picker("Цаг", selection: $slot) {
                        Text("—").tag("")
                        ForEach(["Өглөө", "Өдөр", "Орой", "Шөнө"], id: \.self) { Text($0).tag($0) }
                    }
                    .pickerStyle(.segmented)
                }
                Section("Эмчилгээ, тэмдэглэл") {
                    TextEditor(text: $note).frame(minHeight: 110)
                }
                Section {
                    Text("Эм, үйлчилгээний төлбөрийг одоохондоо компьютер дээрээс нэмнэ. Сүлжээгүй үед бичлэг утсанд хадгалагдаж, холбогдмогц илгээгдэнэ.")
                        .font(.caption).foregroundColor(Color.mute)
                }
            }
            .navigationTitle(inp.horse)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Болих") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Хадгалах") {
                        store.addLog(to: inp,
                                     temp: temp.replacingOccurrences(of: ",", with: "."),
                                     pulse: pulse, resp: resp,
                                     weight: weight.replacingOccurrences(of: ",", with: "."),
                                     slot: slot,
                                     note: note.trimmingCharacters(in: .whitespacesAndNewlines))
                        dismiss()
                    }
                    .disabled(!canSave)
                }
            }
        }
    }

    private func vital(_ label: String, _ hint: String, _ value: Binding<String>, _ pad: UIKeyboardType) -> some View {
        HStack {
            Text(label)
            Spacer()
            TextField(hint, text: value)
                .keyboardType(pad)
                .multilineTextAlignment(.trailing)
                .frame(width: 110)
        }
    }
}

// ── Хүлээлт ──────────────────────────────────────────────────
struct WaitingView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        Screen(title: "Хүлээж байгаа") {
            if store.clinicWaiting.isEmpty { EmptyNote(text: "Хүлээж буй адуу алга") }
            ForEach(store.clinicWaiting) { w in
                Card {
                    HStack {
                        Text(w.horse).font(.headline)
                        Spacer()
                        Text(w.waited).font(.footnote.monospacedDigit()).foregroundColor(Color.mute)
                    }
                    Text("\(w.owner)\(w.phone.isEmpty ? "" : " · " + w.phone)").font(.footnote).foregroundColor(Color.mute)
                    if !w.symptoms.isEmpty { Text(w.symptoms).font(.subheadline) }
                    Text("Хуудас № \(w.examNum.isEmpty ? "—" : w.examNum)\(w.iabd.isEmpty ? "" : " · ИАБД " + w.iabd)")
                        .font(.caption).foregroundColor(Color.mute)
                }
            }
        }
    }
}

// ── Байрлан эмчлүүлэх ─────────────────────────────────────────────────
struct InpListView: View {
    @EnvironmentObject var store: AppStore
    @State private var writing: Inp?
    @State private var query = ""

    var body: some View {
        let list = store.activeInps.filter {
            query.isEmpty || $0.horse.localizedCaseInsensitiveContains(query) || $0.owner.localizedCaseInsensitiveContains(query)
        }
        Screen(title: "Байрлан эмчлүүлэх (\(store.activeInps.count))") {
            TextField("Адуу, эзнээр хайх", text: $query)
                .padding(.horizontal, 12)
                .frame(minHeight: 44)
                .background(Color.white)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
            if list.isEmpty { EmptyNote(text: "Байрлан эмчлүүлж буй адуу алга") }
            ForEach(list) { i in
                InpCard(inp: i, showTask: true) { writing = i }
            }
        }
        .sheet(item: $writing) { i in TreatSheet(inp: i) }
    }
}

// ── Шинжилгээ ────────────────────────────────────────────────
struct LabView: View {
    @EnvironmentObject var store: AppStore
    @State private var onlyMine = false

    var body: some View {
        let list = store.labs.filter { $0.status != "cancelled" && (!onlyMine || $0.docName == store.userName) }
        Screen(title: "Шинжилгээ") {
            Toggle("Зөвхөн миний захиалсан", isOn: $onlyMine).font(.subheadline)
            if list.isEmpty { EmptyNote(text: "Шинжилгээ алга") }
            ForEach(list) { l in
                Card {
                    HStack {
                        Text(l.horse.isEmpty ? "Сорьц" : l.horse).font(.headline)
                        Spacer()
                        Tag(text: l.statusLabel, ok: l.isDone)
                    }
                    Text(l.service).font(.subheadline)
                    Text("\(l.date) · \(l.docName)\(l.owner.isEmpty ? "" : " · " + l.owner)")
                        .font(.caption).foregroundColor(Color.mute)
                }
            }
        }
    }
}

// ── Би ───────────────────────────────────────────────────────
struct MeView: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        Screen(title: "Би") {
            Card {
                Text(store.userName).font(.headline)
                Text(store.role).font(.footnote).foregroundColor(Color.mute)
            }
            StatsCard()
            ScheduleCard()
            NavigationLink {
                DutyListView()
            } label: {
                HStack {
                    Text("Жижүүрийн мэдээ, ээлж хүлээлцэлт")
                    Spacer()
                    Image(systemName: "chevron.right")
                }
                .font(.subheadline)
                .padding(14)
                .frame(maxWidth: .infinity, minHeight: 46)
                .background(Color.white)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.line))
            }
            Card {
                row("Сүлжээ", store.online ? "Холбогдсон" : "Сүлжээгүй")
                row("Сүүлд шинэчилсэн", store.lastSync.map { $0.formatted(date: .omitted, time: .shortened) } ?? "—")
                row("Илгээгээгүй бичлэг", "\(store.pending.count)")
                row("Мэдэгдэл", store.pushStatus)
                row("Хувилбар", "\(Config.version) (\(Config.apnsEnv))")
            }
            Button {
                Task { await store.refresh() }
            } label: {
                Text(store.loading ? "Шинэчилж байна…" : "Одоо шинэчлэх").frame(maxWidth: .infinity, minHeight: 46)
            }
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.navy))
            Button(role: .destructive) {
                store.logout()
            } label: {
                Text("Гарах").frame(maxWidth: .infinity, minHeight: 46)
            }
        }
    }

    private func row(_ label: String, _ value: String) -> some View {
        HStack(alignment: .top) {
            Text(label).foregroundColor(Color.mute)
            Spacer()
            Text(value).multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
    }
}
