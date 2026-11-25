import SwiftUI

@main
struct MoritonEmchApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var store = AppStore.shared
    @Environment(\.scenePhase) private var phase

    var body: some Scene {
        WindowGroup {
            Group {
                if store.loggedIn { MainTabs() } else { LoginView() }
            }
            .environmentObject(store)
            .tint(Color.navy)
            .preferredColorScheme(.light)
            .task { await store.refresh() }
            .onChange(of: phase) { p in
                if p == .active { Task { await store.refresh() } }
            }
        }
    }
}

struct MainTabs: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        TabView(selection: $store.mainTab) {
            HomeView()
                .tabItem { Label("Нүүр", systemImage: "house") }
                .tag(0)
            MyWorkView()
                .tabItem { Label("Миний ажил", systemImage: "stethoscope") }
                .badge(store.unfinishedCount + store.clinicWaiting.count)
                .tag(1)
            InpListView()
                .tabItem { Label("Байрлан", systemImage: "bed.double") }
                .tag(2)
            LabView()
                .tabItem { Label("Шинжилгээ", systemImage: "testtube.2") }
                .badge(store.openLabs.count)
                .tag(3)
            MeView()
                .tabItem { Label("Би", systemImage: "person.crop.circle") }
                .tag(4)
        }
        .onAppear { Notifier.requestPermission() }
        .task {
            // Хүлээлтийг 20 секунд тутам шинэчилнэ (шинэ адуу, «үзлэг явагдаж байна» тэмдэг)
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 20_000_000_000)
                await store.refreshWaiting()
            }
        }
    }
}
