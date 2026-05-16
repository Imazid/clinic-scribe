import SwiftUI
import AuthenticationServices

/// `LoginView` — minimal cream sign-in matching the design package's
/// `IOSSignIn`: warm surface, italic Fraunces "back" accent, single
/// primary CTA + Apple SSO. Preserves the existing AuthViewModel wiring.
struct LoginView: View {
    @StateObject private var vm = AuthViewModel()
    @State private var showSignup = false
    @State private var showForgotPassword = false
    @State private var showPassword = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                Theme.surface.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        topBar

                        VStack(alignment: .leading, spacing: Theme.spacingSm) {
                            (
                                Text("Welcome ")
                                    .font(.system(size: 34, weight: .semibold))
                                    .foregroundStyle(Theme.onSurface)
                                +
                                Text("back").serifItalic()
                                    .font(.system(size: 34, weight: .semibold))
                            )
                            .tracking(-0.5)

                            Text("Sign in to draft from any room.")
                                .font(.subheadline)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }
                        .padding(.top, 28)
                        .padding(.horizontal, 26)

                        VStack(spacing: 14) {
                            authField(
                                label: "WORK EMAIL",
                                placeholder: "you@clinic.com.au",
                                text: $vm.email,
                                keyboard: .emailAddress
                            )

                            VStack(alignment: .leading, spacing: 6) {
                                Text("PASSWORD")
                                    .font(.system(size: 11, weight: .bold))
                                    .tracking(0.7)
                                    .foregroundStyle(Theme.outline)

                                HStack(spacing: 8) {
                                    Group {
                                        if showPassword {
                                            TextField("••••••••••", text: $vm.password)
                                        } else {
                                            SecureField("••••••••••", text: $vm.password)
                                        }
                                    }
                                    .textContentType(.password)
                                    .autocorrectionDisabled(true)
                                    .submitLabel(.go)
                                    .onSubmit { Task { await vm.signIn() } }

                                    Button {
                                        showPassword.toggle()
                                    } label: {
                                        Image(systemName: showPassword ? "eye.slash" : "eye")
                                            .foregroundStyle(Theme.onSurfaceVariant)
                                    }
                                    .accessibilityLabel(showPassword ? "Hide password" : "Show password")
                                }
                                .padding(.horizontal, 16)
                                .frame(height: 50)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .fill(Theme.surfaceContainerLowest)
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14)
                                        .strokeBorder(Theme.outlineVariant, lineWidth: 1)
                                )
                            }

                            HStack {
                                Spacer()
                                Button("Forgot password?") { showForgotPassword = true }
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundStyle(Theme.secondary)
                            }

                            if let error = vm.errorMessage {
                                HStack(spacing: 8) {
                                    Image(systemName: "exclamationmark.triangle")
                                        .foregroundStyle(Theme.error)
                                    Text(error)
                                        .font(.subheadline)
                                        .foregroundStyle(Theme.error)
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 10)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Theme.errorContainer.opacity(0.6))
                                )
                            }
                        }
                        .padding(.top, 28)
                        .padding(.horizontal, 26)
                        .padding(.bottom, 220)
                    }
                }

                bottomActions
            }
            .navigationDestination(isPresented: $showSignup) { SignupView() }
            .navigationDestination(isPresented: $showForgotPassword) { ForgotPasswordView() }
        }
    }

    // MARK: - Top bar

    private var topBar: some View {
        HStack(alignment: .center) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Theme.secondary)
                    .frame(width: 44, height: 44)
                Text("m")
                    .serifItalic()
                    .font(.system(size: 26, weight: .bold).italic())
                    .foregroundStyle(Color.white)
            }
            .shadow(color: Theme.secondary.opacity(0.20), radius: 14, y: 8)

            Spacer()

            Button("Sign up") { showSignup = true }
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.secondary)
        }
        .padding(.horizontal, 26)
        .padding(.top, 14)
    }

    // MARK: - Bottom actions

    private var bottomActions: some View {
        VStack(spacing: 10) {
            CSButton(
                title: vm.isLoading ? "Signing in…" : "Sign in",
                variant: .primary,
                size: .lg,
                isLoading: vm.isLoading,
                isFullWidth: true
            ) {
                Task { await vm.signIn() }
            }

            SignInWithAppleButton(.continue) { request in
                AuthService.shared.prepareAppleSignInRequest(request)
            } onCompletion: { result in
                Task {
                    switch result {
                    case .success(let authorization):
                        do {
                            try await AuthService.shared.completeAppleSignIn(authorization: authorization)
                        } catch {
                            vm.errorMessage = "Apple sign-in failed: \(error.localizedDescription)"
                        }
                    case .failure(let error):
                        let nsError = error as NSError
                        if nsError.code != ASAuthorizationError.canceled.rawValue {
                            vm.errorMessage = "Apple sign-in failed: \(error.localizedDescription)"
                        }
                    }
                }
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 54)
            .clipShape(RoundedRectangle(cornerRadius: 16))

            HStack(spacing: 4) {
                Text("New here?")
                    .foregroundStyle(Theme.onSurfaceVariant)
                Button("Create an account") { showSignup = true }
                    .fontWeight(.bold)
                    .foregroundStyle(Theme.secondary)
            }
            .font(.system(size: 13))
            .padding(.top, 4)
        }
        .padding(.horizontal, 26)
        .padding(.bottom, 38)
    }

    // MARK: - Field helper

    @ViewBuilder
    private func authField(
        label: String,
        placeholder: String,
        text: Binding<String>,
        keyboard: UIKeyboardType
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 11, weight: .bold))
                .tracking(0.7)
                .foregroundStyle(Theme.outline)
            TextField(placeholder, text: text)
                .keyboardType(keyboard)
                .textContentType(.emailAddress)
                .autocorrectionDisabled(true)
                .textInputAutocapitalization(.never)
                .padding(.horizontal, 16)
                .frame(height: 50)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Theme.surfaceContainerLowest)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Theme.outlineVariant, lineWidth: 1)
                )
        }
    }
}
