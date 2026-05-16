import SwiftUI

/// `SignupView` — pixel-faithful port of the design package's `IOSSignUp`:
/// single full-name field, work email, password with strength bar, terms
/// checkbox. Splits full-name into first/last on submit; clinic name is
/// captured during onboarding (defaults to "My Clinic" if signup fires
/// before onboarding completes).
struct SignupView: View {
    @StateObject private var vm = AuthViewModel()
    @Environment(\.dismiss) private var dismiss

    @State private var fullName = ""
    @State private var agreedTerms = true
    @State private var showConfirmation = false

    private var passwordStrength: (label: String, filled: Int, color: Color) {
        let p = vm.password
        if p.isEmpty { return ("", 0, Theme.outline) }
        var score = 0
        if p.count >= 8 { score += 1 }
        if p.count >= 12 { score += 1 }
        if p.contains(where: { $0.isNumber }) { score += 1 }
        if p.contains(where: { !$0.isLetter && !$0.isNumber }) { score += 1 }
        switch score {
        case 0...1: return ("Weak", 1, Theme.error)
        case 2: return ("OK", 2, Theme.warning)
        case 3: return ("Good", 3, Theme.success)
        default: return ("Strong", 4, Theme.success)
        }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            Theme.surface.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(Theme.onSurface)
                                .frame(width: 36, height: 36)
                                .background(Circle().fill(Theme.surfaceContainerLowest))
                                .overlay(
                                    Circle().strokeBorder(Theme.outlineVariant, lineWidth: 1)
                                )
                        }
                        .accessibilityLabel("Back")
                        Spacer()
                    }
                    .padding(.horizontal, 22)
                    .padding(.top, 4)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("CREATE ACCOUNT")
                            .font(.system(size: 11, weight: .bold))
                            .tracking(1.1)
                            .foregroundStyle(Theme.outline)

                        (
                            Text("Start your\n")
                                .font(.system(size: 28, weight: .semibold))
                                .foregroundStyle(Theme.onSurface)
                            +
                            Text("14-day trial").serifItalic()
                                .font(.system(size: 28, weight: .semibold))
                        )
                        .tracking(-0.4)
                        .lineLimit(2)
                    }
                    .padding(.horizontal, 26)
                    .padding(.top, 20)

                    VStack(spacing: 12) {
                        labeledField(
                            label: "FULL NAME",
                            placeholder: "Dr. Ihtisham Mazid",
                            text: $fullName,
                            content: .name
                        )

                        labeledField(
                            label: "WORK EMAIL",
                            placeholder: "you@yourclinic.com.au",
                            text: $vm.email,
                            content: .emailAddress
                        )

                        labeledSecureField(
                            label: "PASSWORD",
                            placeholder: "At least 12 characters",
                            text: $vm.password
                        )

                        if !vm.password.isEmpty {
                            HStack(spacing: 4) {
                                ForEach(0..<4) { idx in
                                    RoundedRectangle(cornerRadius: 9999)
                                        .fill(idx < passwordStrength.filled
                                              ? passwordStrength.color
                                              : Theme.outlineVariant)
                                        .frame(height: 4)
                                }
                                Text(passwordStrength.label)
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundStyle(passwordStrength.color)
                                    .padding(.leading, 6)
                            }
                            .padding(.top, -2)
                        }

                        HStack(alignment: .top, spacing: 10) {
                            Button { agreedTerms.toggle() } label: {
                                ZStack {
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(agreedTerms ? Theme.secondary : Color.clear)
                                        .frame(width: 22, height: 22)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 6)
                                                .strokeBorder(
                                                    agreedTerms ? Theme.secondary : Theme.outlineVariant,
                                                    lineWidth: 1
                                                )
                                        )
                                    if agreedTerms {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundStyle(Color.white)
                                    }
                                }
                            }
                            .accessibilityLabel(agreedTerms ? "Agreed to terms" : "Agree to terms")

                            Text("I agree to the Terms and confirm I'm a registered healthcare practitioner.")
                                .font(.system(size: 12))
                                .foregroundStyle(Theme.onSurfaceVariant)
                                .lineLimit(nil)
                        }
                        .padding(.top, 8)

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
                    .padding(.horizontal, 26)
                    .padding(.top, 24)
                    .padding(.bottom, 160)
                }
            }

            VStack(spacing: 12) {
                CSButton(
                    title: vm.isLoading ? "Creating account…" : "Create account",
                    variant: .primary,
                    size: .lg,
                    isLoading: vm.isLoading,
                    isFullWidth: true,
                    isDisabled: !agreedTerms
                ) {
                    let trimmed = fullName.trimmingCharacters(in: .whitespacesAndNewlines)
                    let parts = trimmed.split(separator: " ", maxSplits: 1, omittingEmptySubsequences: true)
                    vm.firstName = parts.first.map(String.init) ?? ""
                    vm.lastName = parts.count > 1 ? String(parts[1]) : ""
                    if vm.clinicName.isEmpty { vm.clinicName = "My Clinic" }
                    vm.confirmPassword = vm.password
                    Task {
                        await vm.signUp()
                        if vm.errorMessage == nil {
                            showConfirmation = true
                        }
                    }
                }

                Text("No credit card · 14 days free · Cancel anytime")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.outline)
            }
            .padding(.horizontal, 26)
            .padding(.bottom, 30)
        }
        .navigationBarTitleDisplayMode(.inline)
        .alert("Check your inbox", isPresented: $showConfirmation) {
            Button("OK") { dismiss() }
        } message: {
            Text("We sent a confirmation link to \(vm.email). You can keep going on iPhone — verify whenever you're ready.")
        }
    }

    @ViewBuilder
    private func labeledField(
        label: String,
        placeholder: String,
        text: Binding<String>,
        content: UITextContentType
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 11, weight: .bold))
                .tracking(0.7)
                .foregroundStyle(Theme.outline)
            TextField(placeholder, text: text)
                .keyboardType(content == .emailAddress ? .emailAddress : .default)
                .textContentType(content)
                .autocorrectionDisabled(true)
                .textInputAutocapitalization(content == .emailAddress ? .never : .words)
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

    @ViewBuilder
    private func labeledSecureField(label: String, placeholder: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 11, weight: .bold))
                .tracking(0.7)
                .foregroundStyle(Theme.outline)
            SecureField(placeholder, text: text)
                .textContentType(.newPassword)
                .autocorrectionDisabled(true)
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
