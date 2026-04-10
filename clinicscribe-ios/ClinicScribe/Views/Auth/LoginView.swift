import SwiftUI

struct LoginView: View {
    @StateObject private var vm = AuthViewModel()
    @State private var showSignup = false
    @State private var showForgotPassword = false
    @State private var showPassword = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.spacingXL) {
                    // MARK: - Logo Area
                    VStack(spacing: Theme.spacingSm) {
                        Image(systemName: "stethoscope.circle.fill")
                            .font(.system(size: 64))
                            .foregroundStyle(Theme.primary)
                            .accessibilityHidden(true)

                        Text("Miraa")
                            .font(.title.weight(.bold))
                            .foregroundStyle(Theme.primary)

                        Text("Medical Insights, Record, Automation and Assistance")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 60)

                    // MARK: - Form Fields
                    VStack(spacing: Theme.spacingLg) {
                        CSTextField(
                            label: "Email",
                            text: $vm.email,
                            placeholder: "you@clinic.com",
                            keyboardType: .emailAddress
                        )

                        // Password field with visibility toggle
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Password")
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(Theme.onSurface)

                            HStack(spacing: 0) {
                                Group {
                                    if showPassword {
                                        TextField("Enter password", text: $vm.password)
                                    } else {
                                        SecureField("Enter password", text: $vm.password)
                                    }
                                }
                                .onSubmit {
                                    Task { await vm.signIn() }
                                }

                                Button {
                                    showPassword.toggle()
                                } label: {
                                    Image(systemName: showPassword ? "eye.slash" : "eye")
                                        .foregroundStyle(Theme.onSurfaceVariant)
                                        .font(.body)
                                }
                                .accessibilityLabel(showPassword ? "Hide password" : "Show password")
                            }
                            .padding(.horizontal, Theme.spacingMd)
                            .padding(.vertical, Theme.spacingSm + Theme.spacingXS)
                            .background(Theme.surfaceContainerLow)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
                            .overlay {
                                RoundedRectangle(cornerRadius: Theme.radiusSm)
                                    .stroke(Theme.outlineVariant, lineWidth: 1)
                            }
                        }
                        .accessibilityElement(children: .contain)
                        .accessibilityLabel("Password, secure text field")

                        // MARK: - Error Display
                        if let error = vm.errorMessage {
                            HStack(spacing: Theme.spacingSm) {
                                Image(systemName: "exclamationmark.triangle")
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.error)
                                    .accessibilityHidden(true)
                                Text(error)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.error)
                            }
                            .padding(Theme.spacingSm + Theme.spacingXS)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Theme.errorContainer)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
                            .accessibilityLabel("Error: \(error)")
                        }

                        CSButton(title: "Sign In", isLoading: vm.isLoading) {
                            Task { await vm.signIn() }
                        }

                        Button("Forgot Password?") {
                            showForgotPassword = true
                        }
                        .font(.subheadline)
                        .foregroundStyle(Theme.secondary)
                    }
                    .padding(.horizontal, Theme.spacingLg)

                    // MARK: - Divider
                    HStack {
                        Rectangle().frame(height: 1).foregroundStyle(Theme.outlineVariant)
                        Text("or").font(.caption).foregroundStyle(Theme.onSurfaceVariant)
                        Rectangle().frame(height: 1).foregroundStyle(Theme.outlineVariant)
                    }
                    .padding(.horizontal, Theme.spacingLg)

                    // MARK: - Sign Up Link
                    Button {
                        showSignup = true
                    } label: {
                        HStack(spacing: Theme.spacingXS) {
                            Text("Don't have an account?")
                                .foregroundStyle(Theme.onSurfaceVariant)
                            Text("Sign Up")
                                .fontWeight(.semibold)
                                .foregroundStyle(Theme.secondary)
                        }
                        .font(.subheadline)
                    }

                    VStack(spacing: Theme.spacingXS) {
                        Text("By continuing, you agree to the service terms and acknowledge the privacy policy.")
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .multilineTextAlignment(.center)

                        HStack(spacing: Theme.spacingMd) {
                            NavigationLink("Privacy Policy") {
                                LegalDocumentDetailView(document: LegalContentLibrary.privacyPolicy)
                            }
                            NavigationLink("Terms") {
                                LegalDocumentDetailView(document: LegalContentLibrary.termsOfService)
                            }
                            NavigationLink("Legal") {
                                LegalHubView()
                            }
                        }
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.secondary)
                    }
                    .padding(.horizontal, Theme.spacingLg)
                }
            }
            .background(Theme.surface)
            .navigationDestination(isPresented: $showSignup) {
                SignupView()
            }
            .navigationDestination(isPresented: $showForgotPassword) {
                ForgotPasswordView()
            }
        }
    }
}
