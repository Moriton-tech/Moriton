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

// ── Миний ажил: Хүлээлт · Даалгавар · Түүх ───────────────────
enum WorkTab: String, CaseIterable, Identifiable {
    case waiting = "Хүлээлт", tasks = "Даалгавар", history = "Түүх"
    var id: String { rawValue }
    var icon: String {
        switch self {
        case .waiting: return "clock"
        case .tasks: return "checklist"
        case .history: return "clock.arrow.circlepath"
        }
    }
}

struct MyWorkView: View {
    @EnvironmentObject var store: AppStore
    @State private var writing: Inp?
    @State private var examining: Wait?
    @State private var query = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                OfflineBar()
                ErrorBar()
                HStack(spacing: 8) {
                    ForEach(WorkTab.allCases) { t in chip(t) }
                }
                .padding(.horizontal, 16).padding(.vertical, 10)
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        switch store.workTab {
                        case .waiting: waitingList
                        case .tasks: taskList
                        case .history: historyList
                        }
                    }
                    .padding(.horizontal, 16).padding(.bottom, 16)
                }
                .refreshable { await store.refresh() }
            }
            .background(Color.ground)
            .navigationTitle("Миний ажил")
            .navigationBarTitleDisplayMode(.inline)
        }
        .sheet(item: $writing) { i in TreatSheet(inp: i) }
        .sheet(item: $examining) { w in ExamSheet(wait: w) }
    }

    private func count(_ t: WorkTab) -> Int {
        switch t {
        case .waiting: return store.clinicWaiting.count
        case .tasks: return store.unfinishedCount
        case .history: return 0
        }
    }
    /// Дээд сонголт: идэвхтэй нь бараан дүүргэлттэй, тоотой
    private func chip(_ t: WorkTab) -> some View {
        let on = store.workTab == t
        let n = count(t)
        return Button { store.workTab = t } label: {
            HStack(spacing: 6) {
                Image(systemName: t.icon).font(.footnote)
                Text(t.rawValue).font(.subheadline.weight(.semibold))
                if n > 0 {
                    Text("\(n)")
                        .font(.caption2.weight(.bold).monospacedDigit())
                        .padding(.horizontal, 6).padding(.vertical, 2)
                        .background(on ? Color.gold : Color.navy)
                        .foregroundColor(on ? Color.navy : .white)
                        .clipShape(Capsule())
                }
            }
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(on ? Color.navy : Color.white)
            .foregroundColor(on ? .white : Color.ink)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(on ? Color.navy : Color.line))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .accessibilityLabel(n > 0 ? "\(t.rawValue), \(n)" : t.rawValue)
    }
    private func start(_ w: Wait) { store.errorText = nil; examining = w }

    // ── Хүлээлтийн жагсаалт ──
    @ViewBuilder private var waitingList: some View {
        if store.clinicWaiting.isEmpty { EmptyNote(text: "Хүлээж буй адуу алга") }
        ForEach(store.clinicWaiting) { w in WaitCard(wait: w) { start(w) } }
    }

    // ── Даалгаврын жагсаалт ──
    @ViewBuilder private var taskList: some View {
        let tasks = store.myTasks
        Text("Өнөөдрийн даалгавар").font(.subheadline.bold())
        if tasks.isEmpty { EmptyNote(text: "Өнөөдөр танд хуваарилсан адуу алга") }
        ForEach(tasks) { i in InpCard(inp: i, showTask: true) { writing = i } }
        let others = store.myOthers
        if !others.isEmpty {
            Text("Миний эмчилж буй бусад адуу").font(.subheadline.bold()).padding(.top, 8)
            ForEach(others) { i in InpCard(inp: i, showTask: false) { writing = i } }
        }
    }

    // ── Түүхийн жагсаалт ──
    @ViewBuilder private var historyList: some View {
        let list = store.myExams.filter {
            query.isEmpty || $0.horse.localizedCaseInsensitiveContains(query) || $0.owner.localizedCaseInsensitiveContains(query)
                || $0.examNum.contains(query) || $0.diagnosis.localizedCaseInsensitiveContains(query)
        }
        TextField("Адуу, эзэн, онош, хуудасны №", text: $query)
            .padding(.horizontal, 12)
            .frame(minHeight: 44)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
        Text("Миний үзсэн адуу · \(list.count)").font(.subheadline.bold())
        if list.isEmpty { EmptyNote(text: "Үзлэг олдсонгүй") }
        ForEach(list.prefix(60)) { e in ExamRow(exam: e) }
        if list.count > 60 {
            NavigationLink("Бүх \(list.count) үзлэгийг харах ›") { HistoryView() }.font(.subheadline)
        }
    }
}

struct WaitCard: View {
    @EnvironmentObject var store: AppStore
    let wait: Wait
    let onStart: () -> Void

    var body: some View {
        Card {
            HStack {
                Text(wait.horse).font(.headline)
                Spacer()
                Text(wait.waited).font(.footnote.monospacedDigit()).foregroundColor(Color.mute)
            }
            Text("\(wait.owner)\(wait.phone.isEmpty ? "" : " · " + wait.phone)").font(.footnote).foregroundColor(Color.mute)
            if !wait.symptoms.isEmpty { Text(wait.symptoms).font(.subheadline) }
            Text("Хуудас № \(wait.examNum.isEmpty ? "—" : wait.examNum)\(wait.iabd.isEmpty ? "" : " · ИАБД " + wait.iabd)")
                .font(.caption).foregroundColor(Color.mute)
            if busy {
                Label("Үзлэг явагдаж байна · \(wait.examBy)", systemImage: "stethoscope")
                    .font(.footnote.weight(.semibold))
                    .padding(.horizontal, 10).padding(.vertical, 6)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.warnBg).foregroundColor(Color.warnFg)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            Button { if busy { asking = true } else { onStart() } } label: {
                Text(busy ? "Би үзнэ" : "Үзлэг эхлүүлэх").font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 46)
            }
            .background(busy ? Color.white : Color.navy).foregroundColor(busy ? Color.navy : .white)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.navy))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .disabled(!store.canExam)
            if !store.canExam {
                Text("Үзлэг хийх эрх танд байхгүй").font(.caption).foregroundColor(Color.mute)
            }
        }
        .confirmationDialog("\(wait.horse)-г \(wait.examBy) үзэж байна. Та авч үзэх үү?", isPresented: $asking, titleVisibility: .visible) {
            Button("Тийм, би үзнэ") { onStart() }
            Button("Болих", role: .cancel) {}
        }
    }
    @State private var asking = false
    /// Өөр хүн энэ адууны үзлэгийг эхлүүлсэн үү
    private var busy: Bool { wait.examActive && wait.examBy != store.userName }
}

struct ExamRow: View {
    let exam: Exam
    var body: some View {
        NavigationLink {
            ExamDetailView(examId: exam.id)
        } label: {
            Card {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(exam.horse).font(.headline).foregroundColor(Color.ink)
                        Text("\(exam.date) · № \(exam.examNum.isEmpty ? "—" : exam.examNum) · \(exam.owner)")
                            .font(.caption).foregroundColor(Color.mute)
                        if !exam.diagnosis.isEmpty {
                            Text(exam.diagnosis).font(.footnote).foregroundColor(Color.ink).lineLimit(2).multilineTextAlignment(.leading)
                        }
                    }
                    Spacer()
                    if exam.imageCount > 0 {
                        Label("\(exam.imageCount)", systemImage: "photo").font(.caption).foregroundColor(Color.mute)
                    }
                    Image(systemName: "chevron.right").font(.footnote).foregroundColor(Color.mute)
                }
            }
        }
    }
}

struct InpCard: View {
    @EnvironmentObject var store: AppStore
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
                if store.canTreat {
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
                } else {
                    Spacer()
                }
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

// ── Эмчилгээ бичих (вэбийн өдрийн бичлэгтэй ижил талбарууд) ──
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
    @State private var diagnosis = ""
    @State private var services: [String] = []
    @State private var meds: [MedLine] = []
    @State private var loaded = false

    private var svcTotal: Double { services.reduce(0) { $0 + store.price(of: $1) } }
    private var medTotal: Double { meds.reduce(0) { $0 + $1.priceValue } }
    private var canSave: Bool {
        !note.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !diagnosis.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            || !services.isEmpty || !meds.isEmpty
    }
    private var medNames: Binding<[String]> {
        Binding(
            get: { meds.map { $0.name } },
            set: { names in
                meds.removeAll { !names.contains($0.name) }
                for n in names where !meds.contains(where: { $0.name == n }) { meds.append(store.newMedLine(n)) }
            })
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
                    TextEditor(text: $note).frame(minHeight: 90)
                }
                Section("Онош (өөрчлөгдсөн бол)") {
                    TextField("Онош", text: $diagnosis, axis: .vertical)
                }
                Section("Үйлчилгээ") {
                    NavigationLink {
                        PickList(title: "Үйлчилгээ", all: store.services, selected: $services) { Money.fmt(store.price(of: $0)) }
                    } label: {
                        Text(services.isEmpty ? "Үйлчилгээ сонгох" : services.joined(separator: ", "))
                            .foregroundColor(services.isEmpty ? Color.mute : Color.ink).lineLimit(3)
                    }
                }
                Section("Эм, тариа") {
                    NavigationLink {
                        PickList(title: "Эм, тариа", all: store.medNames, selected: medNames)
                    } label: {
                        Text("Эм нэмэх").foregroundColor(Color.navy)
                    }
                    ForEach($meds) { $m in
                        MedRow(med: $m) { meds.removeAll { $0.id == m.id } }
                    }
                }
                Section {
                    HStack {
                        Text("Өдрийн дүн").bold()
                        Spacer()
                        Text(Money.fmt(svcTotal + medTotal)).bold().monospacedDigit()
                    }
                    Text("Сүлжээгүй үед бичлэг утсанд хадгалагдаж, холбогдмогц илгээгдэнэ.")
                        .font(.caption).foregroundColor(Color.mute)
                }
            }
            .navigationTitle(inp.horse)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Болих") { dismiss() } }
                ToolbarItem(placement: .navigationBarTrailing) {
                    TemplateMenu { t in
                        // Загвараас: зөвлөгөө, үйлчилгээ, эмийг нэмнэ (бичсэнийг дарахгүй)
                        if note.isEmpty { note = t.s("note") }
                        for s in (t["services"] as? [Any] ?? []).compactMap({ $0 as? String }) where !services.contains(s) { services.append(s) }
                        for m in t.recs("meds") where !meds.contains(where: { $0.name == m.s("name") }) {
                            var line = store.newMedLine(m.s("name"))
                            line.note = m.s("note")
                            meds.append(line)
                        }
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Хадгалах") {
                        let svc: [Rec] = services.map { ["name": $0, "price": store.price(of: $0)] }
                        store.addLog(to: inp,
                                     temp: temp.replacingOccurrences(of: ",", with: "."),
                                     pulse: pulse, resp: resp,
                                     weight: weight.replacingOccurrences(of: ",", with: "."),
                                     slot: slot,
                                     note: note.trimmingCharacters(in: .whitespacesAndNewlines),
                                     diagnosis: diagnosis.trimmingCharacters(in: .whitespacesAndNewlines),
                                     services: svc,
                                     meds: meds.map { $0.rec })
                        dismiss()
                    }
                    .disabled(!canSave)
                }
            }
            .onAppear {
                // Эмчилгээний курсийн өнөөдрийн эмийг автоматаар бэлтгэнэ (вэбтэй ижил)
                guard !loaded else { return }
                loaded = true
                meds = store.courseLines(for: inp, date: Day.today)
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

/// Эмийн нэг мөр: тоо × нэгжийн үнэ = үнэ (үнийг гараар засаж болно)
struct MedRow: View {
    @Binding var med: MedLine
    let onRemove: () -> Void

    private var computed: String { String(Int64((med.qtyValue * med.unitPrice).rounded())) }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(med.name).font(.subheadline.weight(.semibold))
                if med.course != nil { Tag(text: "курс", ok: true) }
                Spacer()
                Button(role: .destructive, action: onRemove) { Image(systemName: "xmark.circle") }
                    .buttonStyle(.borderless)
                    .accessibilityLabel("\(med.name) хасах")
            }
            HStack(spacing: 8) {
                TextField("тоо", text: $med.qty)
                    .keyboardType(.decimalPad)
                    .frame(width: 56)
                    .onChange(of: med.qty) { _ in
                        if !med.manualPrice { med.price = computed }
                    }
                Text(med.unit.isEmpty ? "нэгж" : med.unit).font(.footnote).foregroundColor(Color.mute)
                Spacer()
                TextField("үнэ", text: $med.price)
                    .keyboardType(.numberPad)
                    .multilineTextAlignment(.trailing)
                    .frame(width: 90)
                    .onChange(of: med.price) { v in
                        if v != computed { med.manualPrice = true }
                    }
                Text("₮").font(.footnote).foregroundColor(Color.mute)
            }
            TextField("Тайлбар, заавар", text: $med.note).font(.footnote)
            if med.unitPrice == 0 {
                Text("Каталогт нэгжийн үнэ оруулаагүй").font(.caption2).foregroundColor(Color.warnFg)
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

// ── Би: профайл, KPI, хувиар, тохиргоо ───────────────────────
struct MeView: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        Screen(title: "Би") {
            ProfileHeader()
            link("chart.bar", "Миний KPI", "Үзлэг, ачаалал, ажилласан өдөр — графикаар") { KPIView() }
            ScheduleCard()
            link("banknote", "Миний урамшуулал", "Энэ сарын урьдчилсан тооцоо") { BonusView() }
            link("doc.on.doc", "Миний загварууд", "Зөвлөгөө, эм тариагаа хадгалж дахин ашиглах") { TemplatesView() }
            link("gearshape", "Тохиргоо", "Мэдэгдэл, төхөөрөмж, гарах") { SettingsView() }
        }
    }

    private func link<D: View>(_ icon: String, _ title: String, _ sub: String?, @ViewBuilder to destination: @escaping () -> D) -> some View {
        NavigationLink(destination: destination) {
            HStack(spacing: 12) {
                Image(systemName: icon).foregroundColor(Color.navy).frame(width: 26)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.subheadline.weight(.semibold)).foregroundColor(Color.ink)
                    if let s = sub { Text(s).font(.caption).foregroundColor(Color.mute) }
                }
                Spacer()
                Image(systemName: "chevron.right").font(.footnote).foregroundColor(Color.mute)
            }
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: 56)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.line))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}
