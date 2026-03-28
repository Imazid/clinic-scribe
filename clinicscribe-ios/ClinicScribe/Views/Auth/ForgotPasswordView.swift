import SwiftUI

struct ForgotPasswordView: View {
    @StateObject private var vm = AuthViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var showConfirmation = false

    var body: some View {
        VStack(spacing: Theme.spacingLg) {
            Spacer()

            // MARK: - Icon
            Image(systemName: "envelope.badge")
                .font(.system(size: 48))
                .foregroundStyle(Theme.secondary)
                .accessibilityHidden(true)

            // MARK: - Header
            VStack(spacing: Theme.spacingSm) {
                Text("Reset Password")
                    .font(.title.weight(.bold))
                    .foregroundStyle(Theme.primary)

                Text("Enter your email address and we'll send you a link to reset your password")
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)
            }

            // MARK: - Form
            VStack(spacing: Theme.spacingMd) {
                CSTextField(label: "Email", text: $vm.email, placeholder: "you@clinic.com", keyboardType: .emailAddress)

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

                CSButton(title: "Send Reset Link", isLoading: vm.isLoading) {
                    Task {
                        await vm.resetPassword()
                        if vm.errorMessage == nil { showConfirmation = true }
                    }
                }
            }
            .padding(.horizontal, Theme.spacingLg)

            // MARK: - Back to Sign In
            Button {
                dismiss()
            } label: {
                HStack(spacing: Theme.spacingXS) {
                    Image(systemName: "arrow.left")
                    Text("Back to Sign In")
                }
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.secondary)
            }

            Spacer()
        }
        .padding(Theme.spacingLg)
        .background(Theme.surface)
        .navigationTitle("Forgot Password")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Email Sent", isPresented: $showConfirmation) {
            Button("OK") { dismiss() }
        } message: {
            Text("Check your inbox for a password reset link.")
        }
    }
}
