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
        TabView {
            MyWorkView()
                .tabItem { Label("Миний ажил", systemImage: "checklist") }
                .badge(store.unfinishedCount)
            WaitingView()
                .tabItem { Label("Хүлээлт", systemImage: "clock") }
                .badge(store.clinicWaiting.count)
            InpListView()
                .tabItem { Label("Байрлагч", systemImage: "bed.double") }
            LabView()
                .tabItem { Label("Шинжилгээ", systemImage: "testtube.2") }
                .badge(store.openLabs.count)
            MeView()
                .tabItem { Label("Би", systemImage: "person.crop.circle") }
        }
        .onAppear { Notifier.requestPermission() }
    }
}
