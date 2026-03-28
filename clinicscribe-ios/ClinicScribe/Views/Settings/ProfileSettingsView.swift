import SwiftUI

struct ProfileSettingsView: View {
    @ObservedObject var vm: SettingsViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showSavedConfirmation = false

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.spacingLg) {
                // MARK: - Personal Information
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    Text("Personal Information")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .padding(.leading, Theme.spacingXS)

                    VStack(spacing: Theme.spacingMd) {
                        CSTextField(label: "First Name", text: $vm.firstName)
                        CSTextField(label: "Last Name", text: $vm.lastName)
                    }
                    .cardStyle()
                }

                // MARK: - Professional Details
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    Text("Professional Details")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .padding(.leading, Theme.spacingXS)

                    VStack(spacing: Theme.spacingMd) {
                        CSTextField(label: "Specialty", text: $vm.specialty)
                        CSTextField(label: "Provider Number", text: $vm.providerNumber)
                    }
                    .cardStyle()
                }

                // MARK: - Save Button
                CSButton(
                    title: showSavedConfirmation ? "Saved!" : "Save Changes",
                    variant: .primary,
                    isLoading: vm.isSaving
                ) {
                    Task {
                        await vm.saveProfile()
                        withAnimation(.easeInOut(duration: Theme.animationDefault)) {
                            showSavedConfirmation = true
                        }
                        try? await Task.sleep(nanoseconds: 1_500_000_000)
                        withAnimation(.easeInOut(duration: Theme.animationDefault)) {
                            showSavedConfirmation = false
                        }
                    }
                }
                .disabled(vm.isSaving)
                .overlay(alignment: .leading) {
                    if showSavedConfirmation {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(Theme.onPrimary)
                            .padding(.leading, Theme.spacingMd)
                            .transition(.scale.combined(with: .opacity))
                    }
                }
                .padding(.top, Theme.spacingSm)
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("Edit Profile")
    }
}
