import SwiftUI
import UIKit

// ── Камер ────────────────────────────────────────────────────
struct CameraPicker: UIViewControllerRepresentable {
    let onImage: (Data) -> Void
    var source: UIImagePickerController.SourceType? = nil
    var maxSide: CGFloat = 1600
    var quality: CGFloat = 0.72
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        let wanted = source ?? .camera
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(wanted) ? wanted : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraPicker
        init(_ parent: CameraPicker) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController,
                                   didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let img = info[.originalImage] as? UIImage, let data = CameraPicker.jpeg(img, maxSide: parent.maxSide, quality: parent.quality) {
                parent.onImage(data)
            }
            parent.dismiss()
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }

    /// Урт талыг 1600px болтол жижигрүүлж JPEG болгоно (сүлжээ, хадгалах зай хэмнэнэ)
    static func jpeg(_ image: UIImage, maxSide: CGFloat, quality: CGFloat) -> Data? {
        let side = max(image.size.width, image.size.height)
        let scale = side > maxSide ? maxSide / side : 1
        let size = CGSize(width: (image.size.width * scale).rounded(), height: (image.size.height * scale).rounded())
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        let out = UIGraphicsImageRenderer(size: size, format: format).image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
        return out.jpegData(compressionQuality: quality)
    }
}

/// Зураг авах бичлэг (үзлэг эсвэл байрлан эмчлүүлж буй адуу)
struct PhotoTarget: Identifiable {
    let col: String
    let id: String
    let horse: String
}

struct PhotoButton: View {
    @EnvironmentObject var store: AppStore
    let target: PhotoTarget
    let count: Int
    @State private var shooting = false

    var body: some View {
        let waiting = store.pendingPhotos(for: target.id)
        Button {
            shooting = true
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "camera")
                if count + waiting > 0 { Text("\(count + waiting)").font(.caption.monospacedDigit()) }
            }
            .frame(minWidth: 46, minHeight: 46)
            .padding(.horizontal, count + waiting > 0 ? 6 : 0)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.navy))
        }
        .accessibilityLabel("\(target.horse) — зураг авах")
        .fullScreenCover(isPresented: $shooting) {
            CameraPicker { data in
                store.addPhoto(data, col: target.col, id: target.id, horse: target.horse)
            }
            .ignoresSafeArea()
        }
    }
}

// ── Жижүүр эмч ───────────────────────────────────────────────
struct DutySection: View {
    @EnvironmentObject var store: AppStore
    @State private var writingReport = false
    @State private var handingOver = false
    @State private var accepting: Duty?

    var body: some View {
        ForEach(store.incomingHandovers) { d in
            Card {
                Text("Ээлж хүлээн авах").font(.headline)
                Text("\(d.docName) · \(d.date) · \(Clock.time(d.handover.d("sentMs")))")
                    .font(.caption).foregroundColor(Color.mute)
                if !d.handover.s("note").isEmpty { Text(d.handover.s("note")).font(.subheadline) }
                Button { accepting = d } label: {
                    Text("Харж, хүлээн авах").font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 46)
                }
                .background(Color.gold).foregroundColor(Color.navy)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        if store.isDutyToday {
            let mine = store.myDutyToday
            Card {
                HStack {
                    Text("Та өнөөдөр жижүүр эмч").font(.headline)
                    Spacer()
                    Image(systemName: "moon.stars").foregroundColor(Color.gold)
                }
                HStack(spacing: 8) {
                    Button { writingReport = true } label: {
                        Text(mine?.hasReport == true ? "Мэдээ засах" : "Жижүүрийн мэдээ бичих")
                            .font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 46)
                    }
                    .background(Color.navy).foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    Button { handingOver = true } label: {
                        Text("Ээлж өгөх").font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 46)
                    }
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.navy))
                }
                if let m = mine, m.sent {
                    Text(m.accepted
                         ? "\(m.toName) ээлжийг хүлээн авсан · \(Clock.time(m.handover.d("acceptedMs")))"
                         : "\(m.toName)-д хүлээлгэн өгсөн — хүлээн авахыг хүлээж байна")
                        .font(.caption).foregroundColor(m.accepted ? Color.okFg : Color.warnFg)
                }
            }
        }
        Color.clear.frame(height: 0)
            .sheet(isPresented: $writingReport) { DutyReportSheet() }
            .sheet(isPresented: $handingOver) { HandoverSheet() }
            .sheet(item: $accepting) { d in AcceptSheet(duty: d) }
    }
}

struct DutyReportSheet: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var general = ""
    @State private var treated = ""
    @State private var incidents = ""
    @State private var todo = ""
    @State private var saving = false
    @State private var loaded = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("\(Day.pretty) · байрлан эмчлүүлж буй \(store.activeInps.count) адуу")
                        .font(.footnote).foregroundColor(Color.mute)
                }
                Section("Ерөнхий байдал") { TextEditor(text: $general).frame(minHeight: 70) }
                Section("Хийсэн эмчилгээ, үзлэг") { TextEditor(text: $treated).frame(minHeight: 70) }
                Section("Онцгой тохиолдол, шинээр ирсэн адуу") { TextEditor(text: $incidents).frame(minHeight: 70) }
                Section("Дараагийн ээлжид үлдээх ажил") { TextEditor(text: $todo).frame(minHeight: 70) }
                if let e = store.errorText { Section { Text(e).font(.footnote).foregroundColor(.red) } }
            }
            .navigationTitle("Жижүүрийн мэдээ")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Болих") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button(saving ? "…" : "Хадгалах") {
                        saving = true
                        Task {
                            let ok = await store.saveDutyReport(["general": general, "treated": treated, "incidents": incidents,
                                                                 "todo": todo, "inpCount": store.activeInps.count, "by": store.userName])
                            saving = false
                            if ok { dismiss() }
                        }
                    }
                    .disabled(saving || (general + treated + incidents + todo).trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                guard !loaded, let r = store.myDutyToday?.report else { return }
                loaded = true
                general = r.s("general"); treated = r.s("treated"); incidents = r.s("incidents"); todo = r.s("todo")
            }
        }
    }
}

struct HandoverSheet: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var toId = ""
    @State private var note = ""
    @State private var saving = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Хэнд хүлээлгэн өгөх") {
                    Picker("Эмч", selection: $toId) {
                        Text("Сонгох").tag("")
                        ForEach(store.otherDoctors.map { $0.s("id") }, id: \.self) { id in
                            Text(store.doctors.first { $0.s("id") == id }?.s("name") ?? id).tag(id)
                        }
                    }
                }
                Section("Хүлээлгэн өгөх тэмдэглэл") {
                    TextEditor(text: $note).frame(minHeight: 120)
                    Text("Анхаарах адуу, үргэлжлэх тариа, эзэнд амласан зүйл г.м. Жижүүрийн мэдээ тань хамт харагдана.")
                        .font(.caption).foregroundColor(Color.mute)
                }
                if let e = store.errorText { Section { Text(e).font(.footnote).foregroundColor(.red) } }
            }
            .navigationTitle("Ээлж хүлээлгэн өгөх")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Болих") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button(saving ? "…" : "Өгөх") {
                        saving = true
                        let name = store.doctors.first { $0.s("id") == toId }?.s("name") ?? ""
                        Task {
                            let ok = await store.sendHandover(toDocId: toId, toName: name, note: note.trimmingCharacters(in: .whitespacesAndNewlines))
                            saving = false
                            if ok { dismiss() }
                        }
                    }
                    .disabled(saving || toId.isEmpty)
                }
            }
            .onAppear {
                // Маргаашийн жижүүр эмчийг урьдчилан сонгоно
                guard toId.isEmpty else { return }
                let tomorrow = Day.str(Date().addingTimeInterval(86400))
                if let next = store.otherDoctors.first(where: { store.scheduleStatus(tomorrow, docId: $0.s("id")) == "duty" }) {
                    toId = next.s("id")
                }
            }
        }
    }
}

struct AcceptSheet: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let duty: Duty
    @State private var note = ""
    @State private var saving = false

    var body: some View {
        NavigationStack {
            Form {
                Section("\(duty.docName) · \(duty.date)") {
                    if !duty.handover.s("note").isEmpty { Text(duty.handover.s("note")) }
                    Text("Хүлээлгэн өгөх үед байрлан эмчлүүлж буй: \(duty.handover.s("inpCount")) адуу")
                        .font(.footnote).foregroundColor(Color.mute)
                }
                if duty.hasReport {
                    DutyReportRows(report: duty.report)
                }
                Section("Хүлээн авагчийн тэмдэглэл (заавал биш)") {
                    TextEditor(text: $note).frame(minHeight: 70)
                }
                if let e = store.errorText { Section { Text(e).font(.footnote).foregroundColor(.red) } }
            }
            .navigationTitle("Ээлж хүлээн авах")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Хаах") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button(saving ? "…" : "Хүлээн авлаа") {
                        saving = true
                        Task {
                            let ok = await store.acceptHandover(duty, note: note.trimmingCharacters(in: .whitespacesAndNewlines))
                            saving = false
                            if ok { dismiss() }
                        }
                    }
                    .disabled(saving)
                }
            }
        }
    }
}

struct DutyReportRows: View {
    let report: Rec
    var body: some View {
        let rows: [[String]] = [["Ерөнхий байдал", report.s("general")], ["Хийсэн эмчилгээ, үзлэг", report.s("treated")],
                                ["Онцгой тохиолдол", report.s("incidents")], ["Дараагийн ээлжид", report.s("todo")]]
            .filter { !$0[1].isEmpty }
        ForEach(rows.indices, id: \.self) { i in
            Section(rows[i][0]) { Text(rows[i][1]) }
        }
    }
}

/// Сүүлийн жижүүрийн мэдээнүүд — бүх эмч харна
struct DutyListView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        List {
            if store.duties.isEmpty { Text("Жижүүрийн мэдээ алга").foregroundColor(Color.mute) }
            ForEach(store.duties) { d in
                Section("\(d.date) · \(d.docName)") {
                    if d.hasReport {
                        DisclosureGroup("Мэдээ") {
                            let r = d.report
                            ForEach([r.s("general"), r.s("treated"), r.s("incidents"), r.s("todo")].filter { !$0.isEmpty }, id: \.self) {
                                Text($0).font(.subheadline)
                            }
                        }
                    }
                    if d.sent {
                        Text(d.accepted
                             ? "Ээлж: \(d.toName) хүлээн авсан · \(Clock.time(d.handover.d("acceptedMs")))"
                             : "Ээлж: \(d.toName) хүлээн аваагүй")
                            .font(.footnote).foregroundColor(d.accepted ? Color.okFg : Color.warnFg)
                        if !d.handover.s("note").isEmpty { Text(d.handover.s("note")).font(.subheadline) }
                        if !d.handover.s("acceptNote").isEmpty {
                            Text("Хүлээн авагч: \(d.handover.s("acceptNote"))").font(.footnote).foregroundColor(Color.mute)
                        }
                    }
                }
            }
        }
        .navigationTitle("Жижүүрийн мэдээ")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// ── Миний үзүүлэлт, ажлын хувиар ─────────────────────────────
struct ScheduleCard: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        let cal = Calendar(identifier: .gregorian)
        let now = Date()
        let comps = cal.dateComponents([.year, .month], from: now)
        let first = cal.date(from: comps) ?? now
        let count = cal.range(of: .day, in: .month, for: first)?.count ?? 30
        let lead = (cal.component(.weekday, from: first) + 5) % 7      // Даваагаас эхэлнэ
        let ym = String(Day.today.prefix(7))
        let cells: [Int] = Array(repeating: 0, count: lead) + Array(1...count)
        Card {
            Text("Миний ажлын хувиар · \(ym.replacingOccurrences(of: "-", with: "."))").font(.subheadline.bold())
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 7), spacing: 4) {
                ForEach(["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"], id: \.self) {
                    Text($0).font(.caption2).foregroundColor(Color.mute)
                }
                ForEach(cells.indices, id: \.self) { idx in
                    let day = cells[idx]
                    if day == 0 {
                        Color.clear.frame(height: 34)
                    } else {
                        let date = ym + "-" + String(format: "%02d", day)
                        cell(day, status: store.scheduleStatus(date), today: date == Day.today)
                    }
                }
            }
            HStack(spacing: 12) {
                legend(Color.okBg, "Ажиллах")
                legend(Color.gold, "Жижүүр")
                legend(Color.ground, "Амрах")
            }
            if store.schedule.rec(ym)?.rec(store.myDocId) == nil {
                Text("Энэ сарын хувиар оруулаагүй байна (вэб: Тохиргоо → Ажлын хувиар).")
                    .font(.caption).foregroundColor(Color.mute)
            }
        }
    }
    private func cell(_ day: Int, status: String, today: Bool) -> some View {
        let bg: Color = status == "duty" ? Color.gold : (status == "work" ? Color.okBg : Color.ground)
        return Text("\(day)")
            .font(.footnote.weight(today ? .bold : .regular).monospacedDigit())
            .frame(maxWidth: .infinity, minHeight: 34)
            .background(bg)
            .overlay(RoundedRectangle(cornerRadius: 7).stroke(today ? Color.navy : Color.clear, lineWidth: 2))
            .clipShape(RoundedRectangle(cornerRadius: 7))
            .accessibilityLabel("\(day): \(status == "duty" ? "жижүүр" : (status == "work" ? "ажиллах" : "амрах"))")
    }
    private func legend(_ color: Color, _ text: String) -> some View {
        HStack(spacing: 5) {
            RoundedRectangle(cornerRadius: 3).fill(color).frame(width: 14, height: 14)
                .overlay(RoundedRectangle(cornerRadius: 3).stroke(Color.line))
            Text(text).font(.caption).foregroundColor(Color.mute)
        }
    }
}
