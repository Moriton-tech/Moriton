import SwiftUI

// ── Миний загварууд ──────────────────────────────────────────
/// Маягт дээрх «Загвар» цэс: сонгоход онош / зөвлөгөө / үйлчилгээ / эмийг бөглөнө
struct TemplateMenu: View {
    @EnvironmentObject var store: AppStore
    let onPick: (Rec) -> Void

    var body: some View {
        Menu {
            if store.myTemplates.isEmpty {
                Text("Загвар алга — Би → Миний загварууд")
            }
            ForEach(store.myTemplates.indices, id: \.self) { i in
                Button(store.myTemplates[i].s("title")) { onPick(store.myTemplates[i]) }
            }
        } label: {
            Label("Загвар", systemImage: "doc.on.doc")
        }
    }
}

struct TemplatesView: View {
    @EnvironmentObject var store: AppStore
    @State private var editing: TemplateDraft?

    var body: some View {
        List {
            if store.myTemplates.isEmpty {
                Text("Байнга бичдэг зөвлөгөө, эм тариагаа загвар болгож хадгалаад үзлэг, өдрийн эмчилгээнд нэг товчоор бөглөнө.")
                    .font(.footnote).foregroundColor(Color.mute)
            }
            ForEach(store.myTemplates.indices, id: \.self) { i in
                let t = store.myTemplates[i]
                Button { editing = TemplateDraft(t) } label: {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(t.s("title")).font(.headline).foregroundColor(Color.ink)
                        if !t.s("diagnosis").isEmpty { Text(t.s("diagnosis")).font(.footnote).foregroundColor(Color.mute) }
                        let meds = t.recs("meds").map { $0.s("name") }
                        if !meds.isEmpty { Text(meds.joined(separator: ", ")).font(.caption).foregroundColor(Color.mute).lineLimit(2) }
                    }
                }
                .swipeActions {
                    Button("Устгах", role: .destructive) { store.deleteTemplate(t.s("id")) }
                }
            }
        }
        .navigationTitle("Миний загварууд")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { editing = TemplateDraft() } label: { Image(systemName: "plus") }
                    .accessibilityLabel("Шинэ загвар")
            }
        }
        .sheet(item: $editing) { d in TemplateEditor(draft: d) }
    }
}

struct TemplateDraft: Identifiable {
    let id = UUID()
    var recordId: String? = nil
    var title = ""
    var diagnosis = ""
    var note = ""
    var services: [String] = []
    var meds: [String] = []
    var medNotes: [String: String] = [:]

    init() {}
    init(_ t: Rec) {
        recordId = t.s("id")
        title = t.s("title")
        diagnosis = t.s("diagnosis")
        note = t.s("note")
        services = (t["services"] as? [Any] ?? []).compactMap { $0 as? String }
        for m in t.recs("meds") {
            meds.append(m.s("name"))
            medNotes[m.s("name")] = m.s("note")
        }
    }
    /// Түүхийн үзлэгээс загвар үүсгэх
    init(exam e: Exam) {
        title = e.diagnosis.isEmpty ? e.horse : String(e.diagnosis.prefix(40))
        diagnosis = e.diagnosis
        note = e.note
        services = e.serviceNames
        for m in e.meds {
            meds.append(m.s("name"))
            medNotes[m.s("name")] = m.s("note")
        }
    }
    var medRecs: [Rec] { meds.map { ["name": $0, "note": medNotes[$0] ?? ""] } }
}

struct TemplateEditor: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State var draft: TemplateDraft

    var body: some View {
        NavigationStack {
            Form {
                Section("Загварын нэр") { TextField("ж: Хэвлийн хатгалгаа — анхан", text: $draft.title) }
                Section("Онош") { TextField("Онош (заавал биш)", text: $draft.diagnosis, axis: .vertical) }
                Section("Эмчилгээ, зөвлөгөө") { TextEditor(text: $draft.note).frame(minHeight: 110) }
                Section("Үйлчилгээ") {
                    NavigationLink {
                        PickList(title: "Үйлчилгээ", all: store.services, selected: $draft.services)
                    } label: {
                        Text(draft.services.isEmpty ? "Сонгох" : draft.services.joined(separator: ", "))
                            .foregroundColor(draft.services.isEmpty ? Color.mute : Color.ink).lineLimit(3)
                    }
                }
                Section("Эм, тариа") {
                    NavigationLink {
                        PickList(title: "Эм, тариа", all: store.medNames, selected: $draft.meds)
                    } label: {
                        Text(draft.meds.isEmpty ? "Сонгох" : "\(draft.meds.count) эм")
                            .foregroundColor(draft.meds.isEmpty ? Color.mute : Color.ink)
                    }
                    ForEach(draft.meds, id: \.self) { m in
                        TextField("\(m) — тун, заавар", text: Binding(
                            get: { draft.medNotes[m] ?? "" },
                            set: { draft.medNotes[m] = $0 }))
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle(draft.recordId == nil ? "Шинэ загвар" : "Загвар засах")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Болих") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Хадгалах") {
                        store.saveTemplate(id: draft.recordId,
                                           title: draft.title.trimmingCharacters(in: .whitespacesAndNewlines),
                                           diagnosis: draft.diagnosis.trimmingCharacters(in: .whitespacesAndNewlines),
                                           note: draft.note.trimmingCharacters(in: .whitespacesAndNewlines),
                                           services: draft.services, meds: draft.medRecs)
                        dismiss()
                    }
                    .disabled(draft.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
}

// ── Миний урамшуулал ─────────────────────────────────────────
struct BonusView: View {
    @EnvironmentObject var store: AppStore
    @State private var lastMonth = false
    @State private var tripLines: [AppStore.BonusLine] = []
    @State private var loadingTrips = false

    private var ym: String {
        let cur = String(Day.today.prefix(7))
        return lastMonth ? String(Day.add(cur + "-01", days: -1).prefix(7)) : cur
    }

    var body: some View {
        let b = store.bonusMain(ym: ym)
        let tripTotal = tripLines.reduce(0) { $0 + $1.amount }
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Picker("Сар", selection: $lastMonth) {
                    Text("Энэ сар").tag(false)
                    Text("Өнгөрсөн сар").tag(true)
                }
                .pickerStyle(.segmented)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Урьдчилсан тооцоо · \(ym.replacingOccurrences(of: "-", with: "."))").font(.footnote).foregroundColor(.white.opacity(0.7))
                    Text(Money.fmt(b.mainTotal + tripTotal)).font(.largeTitle.bold().monospacedDigit()).foregroundColor(Color.gold)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.navy)
                .clipShape(RoundedRectangle(cornerRadius: 14))

                Card {
                    Text("Үндсэн үзлэг").font(.subheadline.bold())
                    if b.lines.isEmpty { Text("Энэ сард тооцогдох үзлэг алга").font(.footnote).foregroundColor(Color.mute) }
                    ForEach(b.lines) { l in line(l) }
                    Divider()
                    HStack { Text("Дүн").bold(); Spacer(); Text(Money.fmt(b.mainTotal)).bold().monospacedDigit() }
                }
                Card {
                    Text("Төлөвлөгөөт үзлэг (ээлжээр)").font(.subheadline.bold())
                    if loadingTrips { ProgressView() }
                    if !loadingTrips && tripLines.isEmpty {
                        Text("Энэ сард таны оролцсон ээлж алга").font(.footnote).foregroundColor(Color.mute)
                    }
                    ForEach(tripLines) { l in line(l) }
                    Divider()
                    HStack { Text("Дүн").bold(); Spacer(); Text(Money.fmt(tripTotal)).bold().monospacedDigit() }
                }
                Text("Энэ бол системийн дүрмээр бодсон урьдчилсан тооцоо. Эцсийн дүнг санхүү сар бүр баталдаг — гараар хассан, ангилал сольсон үзлэг батлагдсан дүнд өөрөөр орж болно.\(b.skipped > 0 ? " Тооцоонд ороогүй \(b.skipped) үзлэг байна." : "")")
                    .font(.caption).foregroundColor(Color.mute)
            }
            .padding(16)
        }
        .background(Color.ground)
        .navigationTitle("Миний урамшуулал")
        .navigationBarTitleDisplayMode(.inline)
        .task(id: ym) {
            loadingTrips = true
            tripLines = await store.bonusTrips(ym: ym)
            loadingTrips = false
        }
    }

    private func line(_ l: AppStore.BonusLine) -> some View {
        HStack(alignment: .top) {
            Text(l.label).font(.subheadline)
            Spacer()
            Text("\(l.count) үзлэг").font(.caption.monospacedDigit()).foregroundColor(Color.mute)
            Text(Money.fmt(l.amount)).font(.subheadline.monospacedDigit()).frame(minWidth: 86, alignment: .trailing)
        }
    }
}

// ── Нүүр дээрх ээлж хүлээлцэх актууд ─────────────────────────
struct DutyFeed: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        let list = Array(store.duties.sorted { $0.date == $1.date ? $0.raw.d("ms") > $1.raw.d("ms") : $0.date > $1.date }.prefix(2))
        let toReview = store.canReviewActs ? store.duties.filter { $0.sent && !$0.reviewed }.count : 0
        HStack {
            Text("Жижүүрийн ээлж хүлээлцэх акт").font(.subheadline.bold())
            Spacer()
            NavigationLink("Бүгд ›") { DutyListView() }.font(.subheadline)
        }
        if toReview > 0 {
            NavigationLink { DutyListView() } label: {
                Text("Хянах шаардлагатай \(toReview) акт байна")
                    .font(.footnote.weight(.semibold))
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.warnBg).foregroundColor(Color.warnFg)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        if list.isEmpty {
            Card { Text("Акт хараахан бөглөгдөөгүй").font(.footnote).foregroundColor(Color.mute) }
        }
        ForEach(list) { d in
            NavigationLink { ActDetailView(dutyId: d.id) } label: {
                Card {
                    HStack {
                        Text("\(d.docName)\(d.toName.isEmpty ? "" : " → " + d.toName)").font(.subheadline.weight(.semibold)).foregroundColor(Color.ink)
                        Spacer()
                        Text(d.date.replacingOccurrences(of: "-", with: ".")).font(.caption.monospacedDigit()).foregroundColor(Color.mute)
                    }
                    if d.hasAct {
                        Text("\(d.filledCount)/\(DutyForm.items.count) мөр · нийт \(d.horseTotal) адуу").font(.footnote).foregroundColor(Color.ink)
                    }
                    Text(d.statusLine).font(.caption.weight(.semibold)).foregroundColor(d.accepted ? Color.okFg : Color.warnFg)
                }
            }
        }
    }
}
