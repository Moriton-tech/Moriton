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

// ── Миний ажил: Нүүр · Хүлээлт · Даалгавар · Түүх ────────────
enum WorkTab: String, CaseIterable, Identifiable {
    case home = "Нүүр", waiting = "Хүлээлт", tasks = "Даалгавар", history = "Түүх"
    var id: String { rawValue }
}

struct MyWorkView: View {
    @EnvironmentObject var store: AppStore
    @State private var tab: WorkTab = .home
    @State private var writing: Inp?
    @State private var examining: Wait?
    @State private var query = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                OfflineBar()
                ErrorBar()
                Picker("Хэсэг", selection: $tab) {
                    ForEach(WorkTab.allCases) { t in Text(label(t)).tag(t) }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16).padding(.vertical, 10)
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        switch tab {
                        case .home: home
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

    private func label(_ t: WorkTab) -> String {
        switch t {
        case .waiting: return store.clinicWaiting.isEmpty ? t.rawValue : "\(t.rawValue) \(store.clinicWaiting.count)"
        case .tasks: return store.unfinishedCount == 0 ? t.rawValue : "\(t.rawValue) \(store.unfinishedCount)"
        default: return t.rawValue
        }
    }
    private func start(_ w: Wait) { store.errorText = nil; examining = w }

    // ── Нүүр ──
    @ViewBuilder private var home: some View {
        let tasks = store.myTasks
        let done = tasks.filter { $0.done(on: Day.today) }.count
        let status = store.scheduleStatus(Day.today)
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("\(Day.greeting), \(store.userName)").font(.title3.bold()).foregroundColor(.white)
                    Text(Day.pretty + (status.isEmpty ? "" : " · " + (status == "duty" ? "Жижүүр" : (status == "work" ? "Ажиллах өдөр" : "Амрах өдөр"))))
                        .font(.footnote).foregroundColor(.white.opacity(0.7))
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

        if store.me == nil {
            EmptyNote(text: "«\(store.userName)» хэрэглэгч эмчийн бүртгэлтэй холбогдоогүй байна. Вэб дээр: Тохиргоо → Эмч нар.")
        }

        DutySection()

        ForEach(store.myReturnedDx) { e in
            NavigationLink { ExamDetailView(examId: e.id) } label: {
                HStack {
                    Image(systemName: "arrow.uturn.backward.circle")
                    Text("Ахлах эмч оношийг буцаасан: \(e.horse)").multilineTextAlignment(.leading)
                    Spacer()
                    Image(systemName: "chevron.right")
                }
                .font(.footnote.weight(.semibold))
                .padding(12)
                .background(Color(hex: 0xFBE3E1)).foregroundColor(Color(hex: 0x8A1F18))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }

        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
            tile("\(store.clinicWaiting.count)", "Хүлээж байгаа", .waiting)
            tile(tasks.isEmpty ? "—" : "\(tasks.count - done)", "Бичээгүй даалгавар", .tasks)
            tile("\(store.myExamsToday)", "Өнөөдөр үзсэн", .history)
            tile("\(store.myPendingDx)", "Хянагдаж буй онош", .history)
        }

        if let next = store.clinicWaiting.first {
            Text("Дараагийн адуу").font(.subheadline.bold()).padding(.top, 4)
            WaitCard(wait: next) { start(next) }
        }
        let left = tasks.filter { !$0.done(on: Day.today) }
        if !left.isEmpty {
            Text("Бичээгүй даалгавар").font(.subheadline.bold()).padding(.top, 4)
            ForEach(left.prefix(2)) { i in InpCard(inp: i, showTask: true) { writing = i } }
            if left.count > 2 {
                Button("Бүгдийг харах (\(left.count))") { tab = .tasks }.font(.subheadline)
            }
        }
        if store.myOpenLabs > 0 {
            Text("Таны захиалсан \(store.myOpenLabs) шинжилгээний хариу хүлээгдэж байна").font(.footnote).foregroundColor(Color.mute)
        }
    }

    private func tile(_ value: String, _ text: String, _ target: WorkTab) -> some View {
        Button { tab = target } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(value).font(.title2.bold().monospacedDigit()).foregroundColor(Color.ink)
                Text(text).font(.caption).foregroundColor(Color.mute)
            }
            .padding(12)
            .frame(maxWidth: .infinity, minHeight: 64, alignment: .leading)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.line))
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
