import SwiftUI

@main
struct ClinicScribeApp: App {
    @StateObject private var authService = AuthService.shared

    var body: some Scene {
        WindowGroup {
            Group {
                if authService.isAuthenticated {
                    if authService.isProfileLoaded {
                        MainTabView()
                    } else {
                        ProgressView("Loading profile...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .background(Theme.surface)
                    }
                } else {
                    LoginView()
                }
            }
            .animation(.easeInOut, value: authService.isAuthenticated)
        }
    }
}
