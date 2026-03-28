import SwiftUI

struct SignupView: View {
    @StateObject private var vm = AuthViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var showConfirmation = false

    private var passwordsDoNotMatch: Bool {
        !vm.confirmPassword.isEmpty && !vm.password.isEmpty && vm.password != vm.confirmPassword
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.spacingLg) {
                CSPageHeader(title: "Create Account", subtitle: "Start documenting smarter")

                // MARK: - Personal Info
                VStack(alignment: .leading, spacing: Theme.spacingMd) {
                    Text("Personal Info")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)

                    HStack(spacing: Theme.spacingSm) {
                        CSTextField(label: "First Name", text: $vm.firstName, placeholder: "Jane")
                        CSTextField(label: "Last Name", text: $vm.lastName, placeholder: "Smith")
                    }
                }

                // MARK: - Clinic
                VStack(alignment: .leading, spacing: Theme.spacingMd) {
                    Text("Clinic")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)

                    CSTextField(label: "Clinic Name", text: $vm.clinicName, placeholder: "My Clinic")
                }

                // MARK: - Account
                VStack(alignment: .leading, spacing: Theme.spacingMd) {
                    Text("Account")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)

                    CSTextField(label: "Email", text: $vm.email, placeholder: "you@clinic.com", keyboardType: .emailAddress)

                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        CSTextField(label: "Password", text: $vm.password, placeholder: "Min 8 characters", isSecure: true)

                        Text("Must be at least 8 characters")
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }

                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        CSTextField(label: "Confirm Password", text: $vm.confirmPassword, placeholder: "Repeat password", isSecure: true)

                        if passwordsDoNotMatch {
                            Text("Passwords don't match")
                                .font(.caption)
                                .foregroundStyle(Theme.error)
                                .accessibilityLabel("Error: Passwords don't match")
                        }
                    }
                }

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

                CSButton(title: "Create Account", isLoading: vm.isLoading) {
                    Task {
                        await vm.signUp()
                        if vm.errorMessage == nil {
                            showConfirmation = true
                        }
                    }
                }
            }
            .padding(Theme.spacingLg)
        }
        .background(Theme.surface)
        .navigationTitle("Sign Up")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Check Your Email", isPresented: $showConfirmation) {
            Button("OK") { dismiss() }
        } message: {
            Text("We sent a confirmation link to \(vm.email). Please verify your email to continue.")
        }
    }
}
