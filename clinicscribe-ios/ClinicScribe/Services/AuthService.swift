import Foundation
import Supabase
import AuthenticationServices
import CryptoKit

enum AppleSignInError: LocalizedError {
    case invalidCredential
    case missingIdentityToken
    case tokenEncoding
    case cancelled

    var errorDescription: String? {
        switch self {
        case .invalidCredential: return "Apple did not return a valid credential."
        case .missingIdentityToken: return "Apple sign-in didn't return an identity token."
        case .tokenEncoding: return "Apple's identity token couldn't be decoded."
        case .cancelled: return "Apple sign-in was cancelled."
        }
    }
}

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

    // MARK: - Apple Sign-In

    /// Stored nonce used to verify the Apple ID token. Set when an Apple flow
    /// starts via `prepareAppleSignInRequest` and consumed by
    /// `completeAppleSignIn`.
    private var pendingAppleNonce: String?

    /// Configures the supplied request and returns the raw nonce alongside it
    /// (the SHA-256 hash is what gets sent to Apple). Hold the request and
    /// pass it to ASAuthorizationController; once the credential comes back,
    /// call `completeAppleSignIn(authorization:)`.
    func prepareAppleSignInRequest(_ request: ASAuthorizationAppleIDRequest) {
        let nonce = randomNonce()
        pendingAppleNonce = nonce
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
    }

    /// Completes the Apple flow by exchanging the identity token for a
    /// Supabase session.
    func completeAppleSignIn(authorization: ASAuthorization) async throws {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            throw AppleSignInError.invalidCredential
        }
        guard let identityTokenData = credential.identityToken else {
            throw AppleSignInError.missingIdentityToken
        }
        guard let identityToken = String(data: identityTokenData, encoding: .utf8) else {
            throw AppleSignInError.tokenEncoding
        }
        guard let nonce = pendingAppleNonce else {
            throw AppleSignInError.invalidCredential
        }
        pendingAppleNonce = nil

        let session = try await supabase.auth.signInWithIdToken(
            credentials: .init(provider: .apple, idToken: identityToken, nonce: nonce)
        )

        currentUserId = session.user.id
        isAuthenticated = true
        isProfileLoaded = false
        await loadProfile()
    }

    private func randomNonce(length: Int = 32) -> String {
        precondition(length > 0)
        let charset: [Character] =
            Array("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remaining = length
        while remaining > 0 {
            var random: UInt8 = 0
            let status = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
            if status != errSecSuccess { continue }
            if random < charset.count {
                result.append(charset[Int(random)])
                remaining -= 1
            }
        }
        return result
    }

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.map { String(format: "%02x", $0) }.joined()
    }
}
