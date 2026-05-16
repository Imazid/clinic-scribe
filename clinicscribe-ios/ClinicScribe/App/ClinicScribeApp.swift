import SwiftUI

@main
struct ClinicScribeApp: App {
    @StateObject private var authService = AuthService.shared
    @AppStorage("miraa.onboarding.completed.v1") private var onboardingCompleted: Bool = false

    var body: some Scene {
        WindowGroup {
            Group {
                if authService.isAuthenticated {
                    if authService.isProfileLoaded {
                        if onboardingCompleted {
                            MainTabView()
                        } else {
                            OnboardingView { onboardingCompleted = true }
                        }
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
            .animation(.easeInOut, value: onboardingCompleted)
        }
    }
}
