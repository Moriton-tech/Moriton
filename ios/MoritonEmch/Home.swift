import SwiftUI
import Charts

// ── Нүүр: «одоо юу хийх вэ» гэдэгт хариулна ──────────────────
struct HomeView: View {
    @EnvironmentObject var store: AppStore
    @State private var examining: Wait?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                OfflineBar()
                ErrorBar()
                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        header
                        DutySection()
                        SeniorSection()
                        actions
                        DutyFeed()
                        today
                        week
                    }
                    .padding(16)
                }
                .refreshable { await store.refresh() }
            }
            .background(Color.ground)
            .toolbar(.hidden, for: .navigationBar)
        }
        .sheet(item: $examining) { w in ExamSheet(wait: w) }
    }

    // Толгой: хэн, өнөөдөр ямар өдөр
    private var header: some View {
        let status = store.scheduleStatus(Day.today)
        return HStack(spacing: 12) {
            Button { store.mainTab = 4 } label: { AvatarView(size: 48) }
                .accessibilityLabel("Миний профайл")
            VStack(alignment: .leading, spacing: 2) {
                Text("\(Day.greeting), \(store.userName)").font(.title3.bold())
                Text(Day.pretty).font(.footnote).foregroundColor(Color.mute)
            }
            Spacer()
            if !status.isEmpty {
                Text(status == "duty" ? "Жижүүр" : (status == "work" ? "Ажиллах" : "Амрах"))
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10).padding(.vertical, 5)
                    .background(status == "duty" ? Color.gold : (status == "work" ? Color.okBg : Color.white))
                    .foregroundColor(status == "work" ? Color.okFg : Color.navy)
                    .clipShape(Capsule())
            }
        }
    }

    // Одоо хийх зүйлс — чухлаас нь эхэлж
    @ViewBuilder private var actions: some View {
        let today = Day.today
        let left = store.myTasks.filter { !$0.done(on: today) }
        let surgery = store.activeInps.filter { $0.surgeryPending && ($0.docName == store.userName || $0.docId == store.myDocId) }
        let nothing = store.myReturnedDx.isEmpty && store.clinicWaiting.isEmpty && left.isEmpty && surgery.isEmpty
        Text("Одоо хийх").font(.subheadline.bold())
        if store.me == nil {
            EmptyNote(text: "«\(store.userName)» хэрэглэгч эмчийн бүртгэлтэй холбогдоогүй байна. Вэб дээр: Тохиргоо → Эмч нар.")
        } else if nothing {
            Card {
                HStack(spacing: 10) {
                    Image(systemName: "checkmark.circle.fill").foregroundColor(Color.okFg)
                    Text("Одоогоор хүлээгдэж буй ажил алга").font(.subheadline)
                }
            }
        }
        VStack(spacing: 0) {
            ForEach(store.myReturnedDx) { e in
                NavigationLink { ExamDetailView(examId: e.id) } label: {
                    row("arrow.uturn.backward.circle.fill", Color(hex: 0x8A1F18), "Буцаагдсан онош засах", e.horse, nil)
                }
            }
            if let next = store.clinicWaiting.first(where: { !($0.examActive && $0.examBy != store.userName) }) {
                Button { if store.canExam { store.errorText = nil; examining = next } else { store.workTab = .waiting; store.mainTab = 1 } } label: {
                    row("stethoscope", Color.navy, store.canExam ? "Үзлэг эхлүүлэх: \(next.horse)" : "Хүлээж байна: \(next.horse)",
                        "\(next.owner) · \(next.waited) хүлээсэн", nil)
                }
                if store.clinicWaiting.count > 1 {
                    Button { store.workTab = .waiting; store.mainTab = 1 } label: {
                        row("clock", Color.mute, "Хүлээлтэд өөр \(store.clinicWaiting.count - 1) адуу", nil, nil)
                    }
                }
            }
            if !left.isEmpty {
                Button { store.workTab = .tasks; store.mainTab = 1 } label: {
                    row("checklist", Color.warnFg, "Өдрийн эмчилгээ бичээгүй: \(left.count) адуу",
                        left.prefix(3).map { $0.horse }.joined(separator: ", "), nil)
                }
            }
            ForEach(surgery) { i in
                Button { store.mainTab = 2 } label: {
                    row("cross.case", Color.warnFg, "Мэс засалд хүлээгдэж буй: \(i.horse)",
                        i.surgeryDate.isEmpty ? "огноо товлоогүй" : i.surgeryDate, nil)
                }
            }
        }
        .background(Color.white)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(nothing ? Color.clear : Color.line))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func row(_ icon: String, _ tint: Color, _ title: String, _ sub: String?, _ trailing: String?) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.body).foregroundColor(tint).frame(width: 26)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.subheadline.weight(.semibold)).foregroundColor(Color.ink).multilineTextAlignment(.leading)
                if let s = sub, !s.isEmpty { Text(s).font(.caption).foregroundColor(Color.mute).multilineTextAlignment(.leading) }
            }
            Spacer()
            Image(systemName: "chevron.right").font(.footnote).foregroundColor(Color.mute)
        }
        .padding(.horizontal, 14)
        .frame(minHeight: 56)
        .overlay(Rectangle().fill(Color.line).frame(height: 1), alignment: .bottom)
    }

    // Өнөөдрийн тоо — нэг мөрөнд
    private var today: some View {
        let tasks = store.myTasks
        let done = tasks.filter { $0.done(on: Day.today) }.count
        return Card {
            Text("Өнөөдөр").font(.subheadline.bold())
            HStack(spacing: 0) {
                stat("\(store.myExamsToday)", "үзсэн")
                stat(tasks.isEmpty ? "—" : "\(done)/\(tasks.count)", "даалгавар")
                stat("\(store.myPendingDx)", "онош хянагдаж буй")
                stat("\(store.myOpenLabs)", "шинжилгээ хүлээж буй")
            }
            if !tasks.isEmpty {
                ProgressView(value: Double(done), total: Double(tasks.count)).tint(Color.navy)
            }
        }
    }
    private func stat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.title3.bold().monospacedDigit())
            Text(label).font(.caption2).foregroundColor(Color.mute).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    // Сүүлийн 7 хоногийн ажил — KPI руу хөтөлнө
    private var week: some View {
        let from = Day.add(Day.today, days: -6)
        let k = store.kpi(from: from, to: Day.today, bucket: .day)
        return Card {
            HStack {
                Text("Сүүлийн 7 хоног").font(.subheadline.bold())
                Spacer()
                NavigationLink("Миний KPI ›") { KPIView() }.font(.subheadline)
            }
            WorkChart(points: k.points, height: 130, everyNth: 1)
        }
    }
}

// ── Профайл зураг ────────────────────────────────────────────
struct AvatarView: View {
    @EnvironmentObject var store: AppStore
    let size: CGFloat

    var body: some View {
        Group {
            if let img = store.avatar {
                Image(uiImage: img).resizable().scaledToFill()
            } else {
                ZStack {
                    Color.navy
                    Text(String(store.userName.prefix(1))).font(.system(size: size * 0.42, weight: .bold)).foregroundColor(Color.gold)
                }
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(Circle().stroke(Color.line))
    }
}

// ── KPI ──────────────────────────────────────────────────────
/// Өдөр/долоо хоног/сараар: үзлэг, хамтарсан үзлэг, байрлан эмчилгээний бичлэг
struct WorkChart: View {
    let points: [AppStore.KPIPoint]
    var height: CGFloat = 200
    var everyNth: Int = 5

    var body: some View {
        let labels = points.filter { $0.kind == "Үзлэг" }.map { $0.label }
        let shown = labels.enumerated().filter { $0.offset % max(1, everyNth) == 0 }.map { $0.element }
        Chart(points) { p in
            BarMark(x: .value("Хугацаа", p.label), y: .value("Тоо", p.count))
                .foregroundStyle(by: .value("Төрөл", p.kind))
        }
        .chartForegroundStyleScale(["Үзлэг": Color.navy, "Хамтарсан": Color(hex: 0x6F9BB8), "Байрлан эмчилгээ": Color.gold])
        .chartXAxis { AxisMarks(values: shown) }
        .chartLegend(position: .bottom, alignment: .leading)
        .frame(height: height)
        .accessibilityLabel("Ажлын график: үзлэг, хамтарсан үзлэг, байрлан эмчилгээний бичлэг")
    }
}

struct KPIView: View {
    @EnvironmentObject var store: AppStore
    @State private var period = 0   // 0 энэ сар, 1 өнгөрсөн сар, 2 сүүлийн 3 сар, 3 энэ жил

    private var range: (from: String, to: String, bucket: AppStore.KPIBucket, nth: Int) {
        let today = Day.today
        let ym = String(today.prefix(7))
        switch period {
        case 1:
            let lastEnd = Day.add(ym + "-01", days: -1)
            return (String(lastEnd.prefix(7)) + "-01", lastEnd, .day, 5)
        case 2: return (Day.add(today, days: -90), today, .week, 2)
        case 3: return (String(today.prefix(4)) + "-01-01", today, .month, 1)
        default: return (ym + "-01", today, .day, 5)
        }
    }

    var body: some View {
        let r = range
        let k = store.kpi(from: r.from, to: r.to, bucket: r.bucket)
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Picker("Хугацаа", selection: $period) {
                    Text("Энэ сар").tag(0)
                    Text("Өнгөрсөн сар").tag(1)
                    Text("3 сар").tag(2)
                    Text("Энэ жил").tag(3)
                }
                .pickerStyle(.segmented)
                Text("\(r.from.replacingOccurrences(of: "-", with: ".")) – \(r.to.replacingOccurrences(of: "-", with: "."))")
                    .font(.caption).foregroundColor(Color.mute)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                    tile("\(k.main)", "Үзлэг")
                    tile("\(k.assist)", "Хамтарсан")
                    tile("\(k.planned)", "Төлөвлөгөөт")
                    tile("\(k.horses)", "Адуу")
                    tile("\(k.services)", "Үйлчилгээ")
                    tile("\(k.inpLogs)", "Байрлан эмчилгээ")
                }

                Card {
                    Text("Ажлын ачаалал").font(.subheadline.bold())
                    if k.main + k.assist + k.inpLogs == 0 {
                        EmptyNote(text: "Энэ хугацаанд бичлэг алга")
                    } else {
                        WorkChart(points: k.points, height: 210, everyNth: r.nth)
                    }
                }

                Card {
                    Text("Ажилласан өдөр").font(.subheadline.bold())
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(k.workedDays)").font(.title.bold().monospacedDigit())
                        Text(k.schedDays > 0 ? "/ \(k.schedDays) хуваарьт өдөр" : "өдөр").font(.footnote).foregroundColor(Color.mute)
                    }
                    if k.schedDays > 0 {
                        ProgressView(value: Double(min(k.workedDays, k.schedDays)), total: Double(k.schedDays)).tint(Color.navy)
                    }
                    HStack(spacing: 0) {
                        small(k.workedDays > 0 ? String(format: "%.1f", Double(k.main) / Double(k.workedDays)) : "—", "үзлэг / өдөр")
                        small(k.avgMinutes.map { "\(Int($0.rounded())) мин" } ?? "—", "нэг үзлэгийн дундаж")
                        small("\(k.dutyDays)", "жижүүр")
                    }
                    .padding(.top, 4)
                }

                if !k.topServices.isEmpty {
                    Card {
                        Text("Хамгийн их хийсэн үйлчилгээ").font(.subheadline.bold())
                        Chart(k.topServices) { s in
                            BarMark(x: .value("Тоо", s.count), y: .value("Үйлчилгээ", s.label))
                                .foregroundStyle(Color.navy)
                                .annotation(position: .trailing) { Text("\(s.count)").font(.caption2).foregroundColor(Color.mute) }
                        }
                        .chartXAxis(.hidden)
                        .frame(height: CGFloat(k.topServices.count) * 38 + 10)
                    }
                }
                if !k.topDiagnoses.isEmpty {
                    Card {
                        Text("Давтагдсан онош").font(.subheadline.bold())
                        ForEach(k.topDiagnoses) { d in
                            HStack(alignment: .top) {
                                Text(d.label).font(.footnote)
                                Spacer()
                                Text("\(d.count)").font(.footnote.monospacedDigit()).foregroundColor(Color.mute)
                            }
                        }
                    }
                }
                Text("Мөнгөн дүн харуулахгүй. Тоонууд таны хийсэн болон хамтарсан үзлэг, байрлан эмчилгээний бичлэгээс гарна.")
                    .font(.caption).foregroundColor(Color.mute)
            }
            .padding(16)
        }
        .background(Color.ground)
        .navigationTitle("Миний KPI")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func tile(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.title3.bold().monospacedDigit())
            Text(label).font(.caption2).foregroundColor(Color.mute).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: 60)
        .background(Color.white)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
    private func small(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.subheadline.bold().monospacedDigit())
            Text(label).font(.caption2).foregroundColor(Color.mute).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }
}

// ── Профайл, тохиргоо ────────────────────────────────────────
struct ProfileHeader: View {
    @EnvironmentObject var store: AppStore
    @State private var choosing = false
    @State private var source: UIImagePickerController.SourceType?

    var body: some View {
        Card {
            HStack(spacing: 14) {
                Button { choosing = true } label: {
                    AvatarView(size: 72)
                        .overlay(alignment: .bottomTrailing) {
                            Image(systemName: "camera.fill").font(.caption2).foregroundColor(.white)
                                .padding(5).background(Color.navy).clipShape(Circle())
                        }
                }
                .accessibilityLabel("Профайл зураг солих")
                VStack(alignment: .leading, spacing: 3) {
                    Text(store.userName).font(.title3.bold())
                    Text(store.role).font(.footnote).foregroundColor(Color.mute)
                    if let m = store.me, !m.s("role").isEmpty, m.s("role") != store.role {
                        Text(m.s("role")).font(.caption).foregroundColor(Color.mute)
                    }
                }
                Spacer()
            }
        }
        .confirmationDialog("Профайл зураг", isPresented: $choosing) {
            Button("Зураг авах") { source = .camera }
            Button("Зургийн сангаас сонгох") { source = .photoLibrary }
            Button("Болих", role: .cancel) {}
        }
        .fullScreenCover(isPresented: Binding(get: { source != nil }, set: { if !$0 { source = nil } })) {
            CameraPicker(onImage: { data in store.setAvatar(data) }, source: source, maxSide: 320, quality: 0.6)
                .ignoresSafeArea()
        }
    }
}

struct SettingsView: View {
    @EnvironmentObject var store: AppStore
    private let kinds: [(String, String)] = [("tasks", "Надад адуу хуваарилагдахад"), ("waiting", "Хүлээлтэд шинэ адуу ирэхэд"),
                                             ("dx", "Онош буцаагдахад"), ("lab", "Шинжилгээний хариу гарахад"),
                                             ("duty", "Ээлж хүлээлцэхэд")]

    var body: some View {
        Form {
            Section("Мэдэгдэл") {
                ForEach(kinds.indices, id: \.self) { i in
                    Toggle(kinds[i].1, isOn: Binding(
                        get: { !store.muted.contains(kinds[i].0) },
                        set: { store.setMuted(kinds[i].0, !$0) }))
                }
                Toggle("17:00-д бичээгүй даалгаврыг сануулах", isOn: Binding(
                    get: { store.eveningReminder },
                    set: { store.setEveningReminder($0) }))
                Text("Төлөв: \(store.pushStatus)").font(.caption).foregroundColor(Color.mute)
            }
            Section("Төхөөрөмж") {
                LabeledContent("Сүлжээ", value: store.online ? "Холбогдсон" : "Сүлжээгүй")
                LabeledContent("Сүүлд шинэчилсэн", value: store.lastSync.map { $0.formatted(date: .omitted, time: .shortened) } ?? "—")
                LabeledContent("Илгээгээгүй бичлэг", value: "\(store.pending.count)")
                LabeledContent("Хувилбар", value: "\(Config.version) (\(Config.apnsEnv))")
                Button(store.loading ? "Шинэчилж байна…" : "Одоо шинэчлэх") { Task { await store.refresh() } }
            }
            Section {
                Button("Гарах", role: .destructive) { store.logout() }
            }
        }
        .navigationTitle("Тохиргоо")
        .navigationBarTitleDisplayMode(.inline)
    }
}
