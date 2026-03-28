import Foundation
import Supabase
import AuthenticationServices

@MainActor
final class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var isAuthenticated = false
    @Published var isProfileLoaded = false
    @Published var currentUserId: UUID?
    @Published var currentProfile: Profile?

    /// Convenience accessors
    var clinicId: UUID? { currentProfile?.clinicId }
    var profileId: UUID? { currentProfile?.id }

    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    private init() {
        Task { await checkSession() }
    }

    func checkSession() async {
        do {
            let session = try await supabase.auth.session
            currentUserId = session.user.id
            isAuthenticated = true
            await loadProfile()
        } catch {
            isAuthenticated = false
            currentUserId = nil
            currentProfile = nil
            isProfileLoaded = true
        }
    }

    func loadProfile() async {
        guard let userId = currentUserId else {
            isProfileLoaded = true
            return
        }
        do {
            let profiles: [Profile] = try await supabase.from("profiles")
                .select()
                .eq("user_id", value: userId.uuidString)
                .limit(1)
                .execute()
                .value
            currentProfile = profiles.first
            if currentProfile == nil {
                print("⚠️ No profile found for user_id: \(userId)")
            }
        } catch {
            print("⚠️ Profile load error: \(error)")
            currentProfile = nil
        }
        isProfileLoaded = true
    }

    func signIn(email: String, password: String) async throws {
        let session = try await supabase.auth.signIn(email: email, password: password)
        currentUserId = session.user.id
        isAuthenticated = true
        isProfileLoaded = false
        await loadProfile()
    }

    func signUp(email: String, password: String, firstName: String, lastName: String, clinicName: String) async throws {
        _ = try await supabase.auth.signUp(
            email: email,
            password: password,
            data: [
                "first_name": .string(firstName),
                "last_name": .string(lastName),
                "clinic_name": .string(clinicName),
            ]
        )
    }

    func signOut() async throws {
        try await supabase.auth.signOut()
        isAuthenticated = false
        currentUserId = nil
        currentProfile = nil
        isProfileLoaded = false
    }

    func resetPassword(email: String) async throws {
        try await supabase.auth.resetPasswordForEmail(email)
    }

    func getAccessToken() async -> String? {
        try? await supabase.auth.session.accessToken
    }
}
