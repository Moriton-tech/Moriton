import SwiftUI

// ── Хүлээлтээс авч үзлэг хийх ────────────────────────────────
struct ExamSheet: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let wait: Wait
    @State private var draft = AppStore.ExamDraft()
    @State private var saving = false
    @State private var finished: Exam?

    private var total: Double { draft.services.reduce(0) { $0 + store.price(of: $1) } }

    var body: some View {
        NavigationStack {
            if let e = finished {
                ExamDoneView(exam: e) { dismiss() }
            } else {
                form
            }
        }
        .interactiveDismissDisabled(saving)
    }

    private var form: some View {
        Form {
            Section {
                Text("\(wait.owner)\(wait.phone.isEmpty ? "" : " · " + wait.phone)").font(.footnote).foregroundColor(Color.mute)
                Text("Хуудас № \(wait.examNum.isEmpty ? "автомат" : wait.examNum)\(wait.iabd.isEmpty ? "" : " · ИАБД " + wait.iabd)")
                    .font(.footnote).foregroundColor(Color.mute)
                if !wait.symptoms.isEmpty { Text("Анамнез: \(wait.symptoms)").font(.subheadline) }
            }
            Section("Эмч") {
                HStack { Text("Үндсэн эмч"); Spacer(); Text(store.userName).foregroundColor(Color.mute) }
                Picker("Хамтрагч эмч", selection: $draft.assistDocId) {
                    Text("Байхгүй").tag("")
                    ForEach(store.otherDoctors.map { $0.s("id") }, id: \.self) { id in
                        Text(store.doctors.first { $0.s("id") == id }?.s("name") ?? id).tag(id)
                    }
                }
            }
            Section("Үзүүлэлт") {
                field("Темп °C", "38.0", $draft.temp, .decimalPad)
                field("Зүрхний цохилт", "40", $draft.pulse, .numberPad)
                field("Амьсгал /мин", "12", $draft.resp, .numberPad)
                field("Жин кг", "", $draft.weight, .decimalPad)
            }
            Section("Шинж тэмдэг") {
                NavigationLink {
                    PickList(title: "Шинж тэмдэг", all: Catalog.symptoms, selected: $draft.symptoms)
                } label: {
                    summary("Сонгох", draft.symptoms)
                }
            }
            Section("Онош (заавал)") {
                TextEditor(text: $draft.diagnosis).frame(minHeight: 60)
            }
            Section("Үйлчилгээ") {
                NavigationLink {
                    PickList(title: "Үйлчилгээ", all: store.services, selected: $draft.services) { Money.fmt(store.price(of: $0)) }
                } label: {
                    summary("Үйлчилгээ сонгох", draft.services)
                }
                if !draft.services.isEmpty {
                    HStack { Text("Нийт").bold(); Spacer(); Text(Money.fmt(total)).bold().monospacedDigit() }
                }
            }
            Section("Эм, тариа") {
                NavigationLink {
                    PickList(title: "Эм, тариа", all: store.medNames, selected: $draft.meds)
                } label: {
                    summary("Эм сонгох", draft.meds)
                }
                ForEach(draft.meds, id: \.self) { m in
                    TextField("\(m) — тун, заавар", text: Binding(
                        get: { draft.medNotes[m] ?? "" },
                        set: { draft.medNotes[m] = $0 }))
                        .font(.footnote)
                }
            }
            Section("Эмчилгээ, зөвлөгөө") {
                TextEditor(text: $draft.note).frame(minHeight: 80)
            }
            if let e = store.errorText { Section { Text(e).font(.footnote).foregroundColor(.red) } }
            Section {
                Button {
                    saving = true
                    Task {
                        var d = draft
                        d.diagnosis = d.diagnosis.trimmingCharacters(in: .whitespacesAndNewlines)
                        d.note = d.note.trimmingCharacters(in: .whitespacesAndNewlines)
                        d.temp = d.temp.replacingOccurrences(of: ",", with: ".")
                        d.weight = d.weight.replacingOccurrences(of: ",", with: ".")
                        finished = await store.finishExam(wait, draft: d)
                        saving = false
                    }
                } label: {
                    Text(saving ? "Хадгалж байна…" : "Үзлэг дуусгах").font(.headline).frame(maxWidth: .infinity, minHeight: 44)
                }
                .disabled(saving || !store.online || draft.diagnosis.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                Text(store.online
                     ? "Дуусгахад нэхэмжлэх үүсч, адуу хүлээлтээс гарна. Онош ахлах эмчид хянагдахаар очно."
                     : "Сүлжээгүй байна — үзлэг дуусгахад сүлжээ хэрэгтэй. Бөглөсөн зүйл энэ цонхонд хэвээр үлдэнэ.")
                    .font(.caption).foregroundColor(store.online ? Color.mute : Color.warnFg)
            }
        }
        .navigationTitle(wait.horse)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) { Button("Болих") { dismiss() }.disabled(saving) }
        }
    }

    private func field(_ label: String, _ hint: String, _ value: Binding<String>, _ pad: UIKeyboardType) -> some View {
        HStack {
            Text(label)
            Spacer()
            TextField(hint, text: value).keyboardType(pad).multilineTextAlignment(.trailing).frame(width: 110)
        }
    }
    private func summary(_ empty: String, _ items: [String]) -> some View {
        Text(items.isEmpty ? empty : items.joined(separator: ", "))
            .foregroundColor(items.isEmpty ? Color.mute : Color.ink)
            .lineLimit(3)
    }
}

/// Хайлттай олон сонголтын жагсаалт (үйлчилгээ, эм, шинж тэмдэг)
struct PickList: View {
    let title: String
    let all: [String]
    @Binding var selected: [String]
    var detail: ((String) -> String)? = nil
    @State private var query = ""

    var body: some View {
        let shown = query.isEmpty ? all : all.filter { $0.localizedCaseInsensitiveContains(query) }
        List {
            if !selected.isEmpty && query.isEmpty {
                Section("Сонгосон") {
                    ForEach(selected, id: \.self) { row($0) }
                }
            }
            Section {
                ForEach(shown.prefix(200), id: \.self) { row($0) }
                if shown.count > 200 { Text("Хайж нарийвчилна уу (\(shown.count))").font(.footnote).foregroundColor(Color.mute) }
            }
        }
        .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Хайх")
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }

    private func row(_ item: String) -> some View {
        let on = selected.contains(item)
        return Button {
            if on { selected.removeAll { $0 == item } } else { selected.append(item) }
        } label: {
            HStack {
                Image(systemName: on ? "checkmark.circle.fill" : "circle").foregroundColor(on ? Color.navy : Color.mute)
                Text(item).foregroundColor(Color.ink)
                Spacer()
                if let d = detail { Text(d(item)).font(.footnote.monospacedDigit()).foregroundColor(Color.mute) }
            }
        }
    }
}

/// Үзлэг дууссаны дараа: зураг оруулах (вэбийн логиктой ижил — дууссан үзлэгт зураг нэмнэ)
struct ExamDoneView: View {
    @EnvironmentObject var store: AppStore
    let exam: Exam
    let onClose: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "checkmark.circle.fill").font(.system(size: 56)).foregroundColor(Color.okFg)
            Text("Үзлэг дууслаа").font(.title2.bold())
            Text("\(exam.horse) · № \(exam.examNum)").foregroundColor(Color.mute)
            Text(exam.dxLabel).font(.footnote).foregroundColor(Color.mute)
            HStack(spacing: 10) {
                Text("Адууны зураг оруулах").font(.subheadline)
                PhotoButton(target: PhotoTarget(col: "exams", id: exam.id, horse: exam.horse), count: 0)
            }
            .padding(14)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.line))
            Text("Зургийг дараа нь «Миний үзсэн адуу» түүхээс ч нэмж болно.").font(.caption).foregroundColor(Color.mute)
            Spacer()
            Button(action: onClose) {
                Text("Болсон").font(.headline).frame(maxWidth: .infinity, minHeight: 50)
            }
            .background(Color.navy).foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.ground)
        .navigationBarBackButtonHidden(true)
    }
}

// ── Миний үзсэн адууны түүх ──────────────────────────────────
struct HistoryView: View {
    @EnvironmentObject var store: AppStore
    @State private var query = ""

    var body: some View {
        let list = store.myExams.filter {
            query.isEmpty || $0.horse.localizedCaseInsensitiveContains(query) || $0.owner.localizedCaseInsensitiveContains(query)
                || $0.examNum.contains(query) || $0.diagnosis.localizedCaseInsensitiveContains(query)
        }
        List {
            if list.isEmpty { Text("Үзлэг олдсонгүй").foregroundColor(Color.mute) }
            ForEach(list.prefix(300)) { e in
                NavigationLink {
                    ExamDetailView(examId: e.id)
                } label: {
                    VStack(alignment: .leading, spacing: 3) {
                        HStack {
                            Text(e.horse).font(.headline)
                            Spacer()
                            if e.imageCount > 0 { Label("\(e.imageCount)", systemImage: "photo").font(.caption).foregroundColor(Color.mute) }
                        }
                        Text("\(e.date) · № \(e.examNum.isEmpty ? "—" : e.examNum) · \(e.owner)").font(.caption).foregroundColor(Color.mute)
                        if !e.diagnosis.isEmpty { Text(e.diagnosis).font(.footnote).lineLimit(2) }
                    }
                }
            }
            if list.count > 300 { Text("Нийт \(list.count) — хайж нарийвчилна уу").font(.footnote).foregroundColor(Color.mute) }
        }
        .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Адуу, эзэн, онош, хуудасны №")
        .navigationTitle("Миний үзсэн адуу (\(store.myExams.count))")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await store.refresh() }
    }
}

struct ExamDetailView: View {
    @EnvironmentObject var store: AppStore
    let examId: String

    var body: some View {
        if let e = store.myExams.first(where: { $0.id == examId }) {
            List {
                Section {
                    line("Огноо", "\(e.date) \(e.raw.s("time"))")
                    line("Хуудас №", e.examNum.isEmpty ? "—" : e.examNum)
                    line("Эзэн", "\(e.owner)\(e.phone.isEmpty ? "" : " · " + e.phone)")
                    line("Эмч", e.assistDocName.isEmpty ? e.docName : "\(e.docName) + \(e.assistDocName)")
                    line("T / P / R / жин", [e.raw.s("temp"), e.raw.s("pulse"), e.raw.s("resp"), e.raw.s("wt")].map { $0.isEmpty ? "—" : $0 }.joined(separator: " / "))
                }
                if !e.anamnesis.isEmpty { Section("Анамнез") { Text(e.anamnesis) } }
                if !e.symptoms.isEmpty { Section("Шинж тэмдэг") { Text(e.symptoms.joined(separator: ", ")) } }
                Section("Онош") {
                    Text(e.diagnosis.isEmpty ? "—" : e.diagnosis)
                    if !e.dxLabel.isEmpty { Text(e.dxLabel).font(.footnote).foregroundColor(Color.mute) }
                }
                if !e.serviceNames.isEmpty { Section("Үйлчилгээ") { ForEach(e.serviceNames, id: \.self) { Text($0) } } }
                if !e.meds.isEmpty {
                    Section("Эм, тариа") {
                        ForEach(e.meds.indices, id: \.self) { i in
                            let m = e.meds[i]
                            Text(m.s("note").isEmpty ? m.s("name") : "\(m.s("name")) — \(m.s("note"))")
                        }
                    }
                }
                if !e.note.isEmpty { Section("Эмчилгээ, зөвлөгөө") { Text(e.note) } }
                Section("Зураг (\(e.imageCount))") {
                    if !e.images.isEmpty {
                        ScrollView(.horizontal) {
                            HStack(spacing: 8) {
                                ForEach(e.images.indices, id: \.self) { i in
                                    if let url = URL(string: e.images[i].s("url")) {
                                        Link(destination: url) {
                                            AsyncImage(url: url) { img in
                                                img.resizable().scaledToFill()
                                            } placeholder: {
                                                Color.ground
                                            }
                                            .frame(width: 96, height: 96)
                                            .clipShape(RoundedRectangle(cornerRadius: 8))
                                        }
                                    }
                                }
                            }
                        }
                    }
                    HStack {
                        Text("Зураг нэмэх")
                        Spacer()
                        PhotoButton(target: PhotoTarget(col: "exams", id: e.id, horse: e.horse), count: 0)
                    }
                }
            }
            .navigationTitle(e.horse)
            .navigationBarTitleDisplayMode(.inline)
        } else {
            Text("Үзлэг олдсонгүй").foregroundColor(Color.mute)
        }
    }

    private func line(_ label: String, _ value: String) -> some View {
        HStack(alignment: .top) {
            Text(label).foregroundColor(Color.mute)
            Spacer()
            Text(value).multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
    }
}
