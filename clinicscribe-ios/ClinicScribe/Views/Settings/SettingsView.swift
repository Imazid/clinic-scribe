import SwiftUI

struct SettingsView: View {
    @StateObject private var vm = SettingsViewModel()
    @ObservedObject private var auth = AuthService.shared

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.spacingLg) {
                // MARK: - Profile Section
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    sectionHeader("Profile")

                    NavigationLink {
                        ProfileSettingsView(vm: vm)
                    } label: {
                        HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                            CSAvatar(
                                initials: vm.profile?.initials ?? "?",
                                size: 48
                            )

                            VStack(alignment: .leading, spacing: 2) {
                                Text(vm.profile?.fullName ?? "Loading...")
                                    .font(.body.weight(.semibold))
                                    .foregroundStyle(Theme.onSurface)
                                Text(vm.profile?.role.rawValue.capitalized ?? "")
                                    .font(.caption)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                                if let email = auth.currentProfile?.userId {
                                    Text(email.uuidString.prefix(8) + "...")
                                        .font(.caption2)
                                        .foregroundStyle(Theme.outline)
                                }
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.outline)
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Profile: \(vm.profile?.fullName ?? "Loading"), \(vm.profile?.role.rawValue.capitalized ?? "")")
                        .accessibilityHint("Tap to edit profile")
                    }
                    .cardStyle()
                }

                // MARK: - Clinic Section
                if let clinic = vm.clinic {
                    VStack(alignment: .leading, spacing: Theme.spacingSm) {
                        sectionHeader("Clinic")

                        VStack(spacing: 0) {
                            settingsInfoRow(icon: "building.2", iconColor: Theme.secondary, label: "Name", value: clinic.name)
                            Divider().padding(.leading, 48)
                            settingsInfoRow(icon: "phone", iconColor: Theme.success, label: "Phone", value: clinic.phone)
                            Divider().padding(.leading, 48)
                            settingsInfoRow(icon: "envelope", iconColor: Theme.primary, label: "Email", value: clinic.email)
                        }
                        .cardStyle(padding: 0)
                    }
                }

                // MARK: - Subscription Section
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    sectionHeader("Subscription")

                    NavigationLink {
                        BillingView(clinic: vm.clinic)
                    } label: {
                        HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                            Image(systemName: "creditcard")
                                .font(.body)
                                .foregroundStyle(Theme.secondary)
                                .frame(width: 36, height: 36)
                                .background(
                                    Circle()
                                        .fill(Theme.secondary.opacity(0.12))
                                )
                                .accessibilityHidden(true)

                            Text("Billing & Plan")
                                .font(.body)
                                .foregroundStyle(Theme.onSurface)

                            Spacer()

                            if let tier = vm.clinic?.subscriptionTier {
                                CSBadge(text: tier.rawValue.capitalized, variant: .info)
                            }

                            Image(systemName: "chevron.right")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.outline)
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Billing & Plan\(vm.clinic?.subscriptionTier != nil ? ", \(vm.clinic!.subscriptionTier.rawValue.capitalized) tier" : "")")
                    }
                    .cardStyle()
                }

                // MARK: - About Section
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    sectionHeader("About")

                    VStack(spacing: 0) {
                        settingsInfoRow(
                            icon: "info.circle",
                            iconColor: Theme.onSurfaceVariant,
                            label: "Version",
                            value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
                        )
                        Divider().padding(.leading, 48)
                        settingsInfoRow(
                            icon: "hammer",
                            iconColor: Theme.onSurfaceVariant,
                            label: "Build",
                            value: Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
                        )
                    }
                    .cardStyle(padding: 0)
                }
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("Settings")
        .task {
            await vm.load()
        }
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(Theme.onSurfaceVariant)
            .padding(.leading, Theme.spacingXS)
    }

    private func settingsInfoRow(icon: String, iconColor: Color, label: String, value: String) -> some View {
        HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(iconColor)
                .frame(width: 36, height: 36)
                .background(
                    Circle()
                        .fill(iconColor.opacity(0.12))
                )
                .accessibilityHidden(true)

            Text(label)
                .font(.subheadline)
                .foregroundStyle(Theme.onSurfaceVariant)

            Spacer()

            Text(value)
                .font(.subheadline)
                .foregroundStyle(Theme.onSurface)
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, Theme.spacingMd)
        .padding(.vertical, Theme.spacingSm + Theme.spacingXS)
    }
}
