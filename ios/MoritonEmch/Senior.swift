import SwiftUI

// ── Ахлах эмчийн хяналт (нүүр дээр) ──────────────────────────
struct SeniorSection: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        if store.isSenior {
            Text("Хяналт").font(.subheadline.bold())
            VStack(spacing: 0) {
                if store.canReviewActs {
                    link("checkmark.seal", "Батлах онош", store.pendingReview.count) { ReviewListView() }
                }
                if store.canAssign {
                    link("person.2", "Хуваарилаагүй адуу", store.unassigned.count) { AssignView() }
                    link("pencil.slash", "Эмчилгээ бичээгүй", store.notWritten.count) { NotWrittenView() }
                }
                if store.canReviewActs {
                    link("doc.text.magnifyingglass", "Хянах акт", store.actsToReview) { DutyListView() }
                }
            }
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.line))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private func link<D: View>(_ icon: String, _ title: String, _ count: Int, @ViewBuilder to destination: @escaping () -> D) -> some View {
        NavigationLink(destination: destination) {
            HStack(spacing: 12) {
                Image(systemName: icon).foregroundColor(Color.navy).frame(width: 26)
                Text(title).font(.subheadline.weight(.semibold)).foregroundColor(Color.ink)
                Spacer()
                Text("\(count)")
                    .font(.subheadline.weight(.bold).monospacedDigit())
                    .padding(.horizontal, 9).padding(.vertical, 3)
                    .background(count > 0 ? Color.gold : Color.ground)
                    .foregroundColor(Color.navy)
                    .clipShape(Capsule())
                Image(systemName: "chevron.right").font(.footnote).foregroundColor(Color.mute)
            }
            .padding(.horizontal, 14)
            .frame(minHeight: 54)
            .overlay(Rectangle().fill(Color.line).frame(height: 1), alignment: .bottom)
        }
        .accessibilityLabel("\(title): \(count)")
    }
}

// ── Онош батлах / буцаах ─────────────────────────────────────
struct ReviewListView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        List {
            if store.pendingReview.isEmpty { Text("Батлах онош алга").foregroundColor(Color.mute) }
            ForEach(store.pendingReview) { e in
                NavigationLink { ReviewDetailView(examId: e.id) } label: {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(e.horse).font(.headline)
                        Text("\(e.date) · № \(e.examNum.isEmpty ? "—" : e.examNum) · \(e.docName)").font(.caption).foregroundColor(Color.mute)
                        Text(e.diagnosis.isEmpty ? "Онош бичээгүй" : e.diagnosis).font(.footnote).lineLimit(2)
                    }
                }
            }
        }
        .navigationTitle("Батлах онош (\(store.pendingReview.count))")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await store.refresh() }
    }
}

struct ReviewDetailView: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let examId: String
    @State private var text = ""
    @State private var reason = ""
    @State private var returning = false
    @State private var saving = false
    @State private var loaded = false

    var body: some View {
        if let e = store.reviewExams.first(where: { $0.id == examId }) {
            Form {
                Section {
                    row("Адуу", e.horse)
                    row("Эзэн", e.owner)
                    row("Эмч", e.assistDocName.isEmpty ? e.docName : "\(e.docName) + \(e.assistDocName)")
                    row("Огноо", "\(e.date) \(e.raw.s("time")) · № \(e.examNum)")
                    row("T / P / R", [e.raw.s("temp"), e.raw.s("pulse"), e.raw.s("resp")].map { $0.isEmpty ? "—" : $0 }.joined(separator: " / "))
                }
                if !e.anamnesis.isEmpty { Section("Анамнез") { Text(e.anamnesis) } }
                if !e.symptoms.isEmpty { Section("Шинж тэмдэг") { Text(e.symptoms.joined(separator: ", ")) } }
                if !e.serviceNames.isEmpty { Section("Үйлчилгээ") { Text(e.serviceNames.joined(separator: ", ")) } }
                if !e.meds.isEmpty { Section("Эм, тариа") { Text(e.meds.map { $0.s("name") }.joined(separator: ", ")) } }
                if !e.note.isEmpty { Section("Эмчилгээ, зөвлөгөө") { Text(e.note) } }
                Section("Онош (засаж баталж болно)") {
                    TextEditor(text: $text).frame(minHeight: 70)
                }
                if returning {
                    Section("Буцаах шалтгаан") {
                        TextEditor(text: $reason).frame(minHeight: 60)
                    }
                }
                if let err = store.errorText { Section { Text(err).font(.footnote).foregroundColor(.red) } }
                Section {
                    Button {
                        act { await store.approveDx(e, text: text) }
                    } label: {
                        Text(saving ? "…" : (text.trimmingCharacters(in: .whitespacesAndNewlines) == e.diagnosis ? "Батлах" : "Засаж батлах"))
                            .font(.headline).frame(maxWidth: .infinity, minHeight: 44)
                    }
                    .disabled(saving)
                    Button(role: .destructive) {
                        if returning { act { await store.returnDx(e, note: reason) } } else { returning = true }
                    } label: {
                        Text(returning ? "Шалтгаантай буцаах" : "Эмчид буцаах").frame(maxWidth: .infinity, minHeight: 44)
                    }
                    .disabled(saving || (returning && reason.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty))
                }
            }
            .navigationTitle(e.horse)
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                guard !loaded else { return }
                loaded = true
                text = e.diagnosis
                store.errorText = nil
            }
        } else {
            Text("Энэ онош аль хэдийн шийдэгдсэн").foregroundColor(Color.mute)
        }
    }
    private func act(_ work: @escaping () async -> Bool) {
        saving = true
        Task {
            let ok = await work()
            saving = false
            if ok { dismiss() }
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

// ── Өглөөний хуваарилалт ─────────────────────────────────────
struct AssignView: View {
    @EnvironmentObject var store: AppStore
    @State private var docOf: [String: String] = [:]
    @State private var taskOf: [String: String] = [:]
    @State private var saving = false
    @State private var loaded = false

    private func saved(_ i: Inp) -> (String, String) {
        let a = i.assign(on: Day.today)
        return (a?.s("docId") ?? "", a?.s("task") ?? "")
    }
    private func dirty(_ i: Inp) -> Bool {
        let s = saved(i)
        return (docOf[i.id] ?? s.0) != s.0 || (taskOf[i.id] ?? s.1) != s.1
    }

    var body: some View {
        let list = store.hospitalToday
        let changed = list.filter { dirty($0) }
        Form {
            Section {
                Text("\(Day.pretty) · \(list.count) адуу · хуваарилаагүй \(store.unassigned.count)").font(.footnote).foregroundColor(Color.mute)
                Button("Эмчлэгч эмчээр нь бөглөх") {
                    for i in list where (docOf[i.id] ?? saved(i).0).isEmpty && !i.docId.isEmpty { docOf[i.id] = i.docId }
                }
                .font(.footnote)
            }
            ForEach(list) { i in
                Section("\(i.horse) · \(i.location.isEmpty ? "байрлалгүй" : i.location) · \(i.day) дахь хоног") {
                    if !i.diagnosis.isEmpty { Text(i.diagnosis).font(.footnote).foregroundColor(Color.mute) }
                    Picker("Эмч", selection: Binding(get: { docOf[i.id] ?? saved(i).0 }, set: { docOf[i.id] = $0 })) {
                        Text("Хуваарилаагүй").tag("")
                        ForEach(store.doctors.map { $0.s("id") }, id: \.self) { id in
                            Text(store.doctors.first { $0.s("id") == id }?.s("name") ?? id).tag(id)
                        }
                    }
                    TextField("Даалгавар (заавал биш)", text: Binding(get: { taskOf[i.id] ?? saved(i).1 }, set: { taskOf[i.id] = $0 }), axis: .vertical)
                        .font(.subheadline)
                }
            }
            if let e = store.errorText { Section { Text(e).font(.footnote).foregroundColor(.red) } }
        }
        .navigationTitle("Өглөөний хуваарилалт")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button(saving ? "…" : (changed.isEmpty ? "Хадгалах" : "Хадгалах (\(changed.count))")) {
                    saving = true
                    let rows = changed.map { (inp: $0, docId: docOf[$0.id] ?? saved($0).0, task: taskOf[$0.id] ?? saved($0).1) }
                    Task {
                        if await store.saveAssignments(rows) { docOf = [:]; taskOf = [:] }
                        saving = false
                    }
                }
                .disabled(saving || changed.isEmpty)
            }
        }
        .onAppear {
            guard !loaded else { return }
            loaded = true
            store.errorText = nil
        }
    }
}

// ── Эмчилгээ бичээгүй адуунууд (эмчээр) ──────────────────────
struct NotWrittenView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        let today = Day.today
        let groups = Dictionary(grouping: store.notWritten) { $0.assign(on: today)?.s("docName") ?? "—" }
        let names = groups.keys.sorted()
        List {
            if names.isEmpty { Text("Хуваарилсан бүх адууны эмчилгээ бичигдсэн").foregroundColor(Color.mute) }
            ForEach(names, id: \.self) { n in
                Section("\(n) · \(groups[n]?.count ?? 0)") {
                    ForEach(groups[n] ?? []) { i in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(i.horse).font(.subheadline.weight(.semibold))
                            Text("\(i.location.isEmpty ? "байрлалгүй" : i.location) · \(i.day) дахь хоног").font(.caption).foregroundColor(Color.mute)
                            if let t = i.assign(on: today)?.s("task"), !t.isEmpty { Text("Даалгавар: \(t)").font(.caption) }
                        }
                    }
                }
            }
        }
        .navigationTitle("Эмчилгээ бичээгүй")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await store.refresh() }
    }
}
