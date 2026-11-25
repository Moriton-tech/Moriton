import Foundation
import UserNotifications
import UIKit

@MainActor
enum Notifier {
    private static let eveningId = "evening-unfinished"

    /// Мэдэгдлийн зөвшөөрөл асууж, Apple-аас төхөөрөмжийн токен авна
    static func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            Task { @MainActor in
                if granted {
                    UIApplication.shared.registerForRemoteNotifications()
                } else {
                    AppStore.shared.pushStatus = "Зөвшөөрөл өгөөгүй (Settings → Notifications)"
                }
            }
        }
    }

    /// Өнөөдрийн даалгавраас бичээгүй үлдсэн бол 17:00-д утас өөрөө сануулна (сервер шаардахгүй)
    static func scheduleEvening(unfinished: Int) {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [eveningId])
        UIApplication.shared.applicationIconBadgeNumber = unfinished
        guard unfinished > 0 else { return }
        var at = Calendar.current.dateComponents([.year, .month, .day], from: Date())
        at.hour = 17
        at.minute = 0
        guard let fire = Calendar.current.date(from: at), fire > Date() else { return }
        let content = UNMutableNotificationContent()
        content.title = "Өдрийн эмчилгээ бичээгүй байна"
        content.body = "Танд хуваарилсан \(unfinished) адууны өнөөдрийн бичлэг дутуу."
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(dateMatching: at, repeats: false)
        center.add(UNNotificationRequest(identifier: eveningId, content: content, trigger: trigger))
    }

    static func cancelEvening() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [eveningId])
        UIApplication.shared.applicationIconBadgeNumber = 0
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        UserDefaults.standard.set(token, forKey: "apns_token")
        Task { @MainActor in
            AppStore.shared.pushStatus = "Токен авсан"
            await AppStore.shared.registerDevice()
        }
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        Task { @MainActor in
            AppStore.shared.pushStatus = "Apple токен өгсөнгүй: \(error.localizedDescription)"
        }
    }

    // Чимээгүй мэдэгдэл (сервэр «дата өөрчлөгдлөө» гэж дохиход) — шууд шинэчилнэ
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                     fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        Task { @MainActor in
            await AppStore.shared.refresh()
            completionHandler(.newData)
        }
    }

    // Апп нээлттэй үед ч мэдэгдлийг харуулна
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .list])
        Task { @MainActor in await AppStore.shared.refresh() }
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        completionHandler()
        Task { @MainActor in await AppStore.shared.refresh() }
    }
}
