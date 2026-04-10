import AVFoundation
import SwiftUI
import UIKit

struct SettingsView: View {
    @StateObject private var vm = SettingsViewModel()
    @Environment(\.openURL) private var openURL

    @State private var microphonePermission = MicrophonePermissionState.current
    @State private var showSignOutConfirmation = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                SettingsHeroCard(
                    initials: vm.profile?.initials ?? "?",
                    name: vm.profile?.fullName ?? "Miraa User",
                    email: vm.accountEmail.isEmpty ? "Loading account" : vm.accountEmail,
                    role: vm.profile?.role.settingsLabel ?? "Clinician",
                    clinicName: vm.clinic?.name ?? "Clinic workspace",
                    subscriptionTier: vm.clinic?.subscriptionTier.rawValue.capitalized ?? "Workspace",
                    subscriptionStatus: vm.clinic?.stripeSubscriptionStatus.settingsStatusLabel ?? "Securely connected"
                )

                SettingsSection(title: "Privacy & Security") {
                    SettingsGroup {
                        SettingsActionRow(
                            icon: "mic.fill",
                            tint: Theme.secondary,
                            title: "Microphone permissions",
                            subtitle: "Manage device access for live capture recording and uploads.",
                            detail: microphonePermission.label,
                            action: handleMicrophoneAccess
                        )

                        SettingsRowDivider()

                        NavigationLink {
                            LegalHubView()
                        } label: {
                            SettingsNavigationRow(
                                icon: "lock.doc.fill",
                                tint: Theme.primary,
                                title: "Legal & Privacy",
                                subtitle: "Privacy policy, terms, data handling, and clinical AI safeguards."
                            )
                        }
                        .buttonStyle(.plain)

                        SettingsRowDivider()

                        NavigationLink {
                            AuditLogView()
                        } label: {
                            SettingsNavigationRow(
                                icon: "clipboard.fill",
                                tint: Theme.warning,
                                title: "Audit Log",
                                subtitle: "Review account activity, workflow history, and governance signals."
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }

                SettingsSection(title: "Defaults") {
                    SettingsGroup {
                        NavigationLink {
                            TemplatesWorkspaceView()
                        } label: {
                            SettingsNavigationRow(
                                icon: "doc.text.fill",
                                tint: Theme.secondary,
                                title: "My Templates",
                                subtitle: "Manage the note formats used for capture, review, and closeout."
                            )
                        }
                        .buttonStyle(.plain)

                        SettingsRowDivider()

                        SettingsValueRow(
                            icon: "square.stack.3d.up.fill",
                            tint: Theme.primary,
                            title: "Workflow",
                            subtitle: "The working path used throughout the app.",
                            detail: "Prepare, Capture, Verify, Tasks"
                        )
                    }
                }

                SettingsSection(title: "Workspace") {
                    SettingsGroup {
                        NavigationLink {
                            BillingView(clinic: vm.clinic)
                        } label: {
                            SettingsNavigationRow(
                                icon: "creditcard.fill",
                                tint: Theme.success,
                                title: "Billing & Plan",
                                subtitle: billingSubtitle
                            )
                        }
                        .buttonStyle(.plain)

                        SettingsRowDivider()

                        NavigationLink {
                            IntegrationsView()
                        } label: {
                            SettingsNavigationRow(
                                icon: "link.circle.fill",
                                tint: Theme.secondary,
                                title: "Integrations",
                                subtitle: "Check downstream systems, export readiness, and sync health."
                            )
                        }
                        .buttonStyle(.plain)

                        if let clinic = vm.clinic {
                            SettingsRowDivider()

                            SettingsValueRow(
                                icon: "building.2.fill",
                                tint: Theme.primary,
                                title: "Clinic",
                                subtitle: clinic.email,
                                detail: clinic.name
                            )
                        }
                    }
                }

                SettingsSection(title: "Account") {
                    SettingsGroup {
                        NavigationLink {
                            ProfileSettingsView(vm: vm)
                        } label: {
                            SettingsNavigationRow(
                                icon: "person.fill",
                                tint: Theme.primary,
                                title: "Account",
                                subtitle: accountSubtitle
                            )
                        }
                        .buttonStyle(.plain)

                        if let clinic = vm.clinic {
                            SettingsRowDivider()

                            SettingsValueRow(
                                icon: "person.3.fill",
                                tint: Theme.warning,
                                title: "Workspace seats",
                                subtitle: clinic.subscriptionTier.rawValue.capitalized + " plan",
                                detail: "\(clinic.subscriptionSeats)"
                            )
                        }
                    }
                }

                SettingsSection(title: "About") {
                    SettingsGroup {
                        SettingsValueRow(
                            icon: "app.fill",
                            tint: Theme.secondary,
                            title: "Version",
                            detail: appVersion
                        )

                        SettingsRowDivider()

                        SettingsValueRow(
                            icon: "hammer.fill",
                            tint: Theme.outline,
                            title: "Build",
                            detail: appBuild
                        )
                    }
                }

                Text("Clinical drafts, transcripts, and follow-up tasks should still be reviewed by a qualified clinician before being relied on or shared.")
                    .font(.footnote)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .padding(.horizontal, Theme.spacingXS)

                Button(role: .destructive) {
                    showSignOutConfirmation = true
                } label: {
                    HStack(spacing: Theme.spacingSm) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .font(.body.weight(.semibold))
                        Text("Log out")
                            .font(.body.weight(.semibold))
                    }
                    .foregroundStyle(Theme.error)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.spacingMd)
                    .background(Theme.surfaceContainerLowest)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    .overlay {
                        RoundedRectangle(cornerRadius: Theme.radiusMd)
                            .stroke(Theme.error.opacity(0.18), lineWidth: 1)
                    }
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, Theme.spacingLg)
            .padding(.vertical, Theme.spacingMd)
        }
        .background(Theme.surface.ignoresSafeArea())
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.large)
        .task {
            await vm.load()
            refreshMicrophonePermission()
        }
        .onAppear {
            refreshMicrophonePermission()
        }
        .alert("Log Out", isPresented: $showSignOutConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Log Out", role: .destructive) {
                Task { try? await AuthService.shared.signOut() }
            }
        } message: {
            Text("You'll need to sign in again to continue using Miraa.")
        }
    }

    private var billingSubtitle: String {
        guard let clinic = vm.clinic else {
            return "Manage clinic billing, seats, and plan access."
        }
        return "\(clinic.subscriptionTier.rawValue.capitalized) plan, \(clinic.stripeSubscriptionStatus.settingsStatusLabel)"
    }

    private var accountSubtitle: String {
        let parts = [
            vm.profile?.role.settingsLabel,
            vm.profile?.specialty?.nonEmptyValue,
        ].compactMap { $0 }

        return parts.isEmpty ? "Edit your clinician identity and profile details." : parts.joined(separator: " / ")
    }

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    private var appBuild: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    private func refreshMicrophonePermission() {
        microphonePermission = .current
    }

    private func handleMicrophoneAccess() {
        switch microphonePermission {
        case .notSet:
            if #available(iOS 17.0, *) {
                AVAudioApplication.requestRecordPermission { _ in
                    Task { @MainActor in
                        refreshMicrophonePermission()
                    }
                }
            } else {
                AVAudioSession.sharedInstance().requestRecordPermission { _ in
                    Task { @MainActor in
                        refreshMicrophonePermission()
                    }
                }
            }
        case .allowed, .off, .unknown:
            guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
            openURL(url)
        }
    }
}

private struct SettingsHeroCard: View {
    let initials: String
    let name: String
    let email: String
    let role: String
    let clinicName: String
    let subscriptionTier: String
    let subscriptionStatus: String

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            HStack(alignment: .center, spacing: Theme.spacingMd) {
                CSAvatar(initials: initials, size: 56)

                VStack(alignment: .leading, spacing: 4) {
                    Text(name)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Theme.onSurface)

                    Text(email)
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }

                Spacer(minLength: 0)

                SettingsPill(text: subscriptionTier)
            }

            VStack(alignment: .leading, spacing: Theme.spacingXS) {
                Text(clinicName)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(Theme.primary)

                HStack(spacing: Theme.spacingSm) {
                    Label(role, systemImage: "stethoscope")
                    Label(subscriptionStatus, systemImage: "checkmark.seal.fill")
                }
                .font(.caption.weight(.medium))
                .foregroundStyle(Theme.onSurfaceVariant)
            }
        }
        .padding(Theme.spacingLg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Theme.surfaceContainerLowest, Theme.surfaceContainerLow],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusLg))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.radiusLg)
                .stroke(Theme.outlineVariant.opacity(0.45), lineWidth: 1)
        }
        .themeShadow(Theme.elevationLow)
    }
}

private struct SettingsPill: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(Theme.secondary)
            .padding(.horizontal, Theme.spacingSm + 2)
            .padding(.vertical, Theme.spacingXS + 2)
            .background(Theme.secondaryFixed.opacity(0.28))
            .clipShape(Capsule())
    }
}

private struct SettingsSection<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text(title)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Theme.onSurfaceVariant)
                .padding(.horizontal, Theme.spacingXS)

            content
        }
    }
}

private struct SettingsGroup<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        VStack(spacing: 0) {
            content
        }
        .background(Theme.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusLg))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.radiusLg)
                .stroke(Theme.outlineVariant.opacity(0.35), lineWidth: 1)
        }
        .themeShadow(Theme.elevationLow)
    }
}

private struct SettingsNavigationRow: View {
    let icon: String
    let tint: Color
    let title: String
    let subtitle: String?

    var body: some View {
        HStack(spacing: Theme.spacingMd) {
            SettingsIcon(icon: icon, tint: tint)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.body)
                    .foregroundStyle(Theme.onSurface)

                if let subtitle, !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .multilineTextAlignment(.leading)
                }
            }

            Spacer(minLength: 0)

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.outline)
        }
        .padding(.horizontal, Theme.spacingMd)
        .padding(.vertical, Theme.spacingMd - 2)
        .contentShape(Rectangle())
    }
}

private struct SettingsActionRow: View {
    let icon: String
    let tint: Color
    let title: String
    let subtitle: String?
    let detail: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.spacingMd) {
                SettingsIcon(icon: icon, tint: tint)

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.body)
                        .foregroundStyle(Theme.onSurface)

                    if let subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .multilineTextAlignment(.leading)
                    }
                }

                Spacer(minLength: 0)

                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.trailing)
            }
            .padding(.horizontal, Theme.spacingMd)
            .padding(.vertical, Theme.spacingMd - 2)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

private struct SettingsValueRow: View {
    let icon: String
    let tint: Color
    let title: String
    var subtitle: String? = nil
    let detail: String

    var body: some View {
        HStack(spacing: Theme.spacingMd) {
            SettingsIcon(icon: icon, tint: tint)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.body)
                    .foregroundStyle(Theme.onSurface)

                if let subtitle, !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .multilineTextAlignment(.leading)
                }
            }

            Spacer(minLength: 0)

            Text(detail)
                .font(.subheadline)
                .foregroundStyle(Theme.onSurfaceVariant)
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, Theme.spacingMd)
        .padding(.vertical, Theme.spacingMd - 2)
    }
}

private struct SettingsIcon: View {
    let icon: String
    let tint: Color

    var body: some View {
        Image(systemName: icon)
            .font(.body.weight(.semibold))
            .foregroundStyle(tint)
            .frame(width: 36, height: 36)
            .background(tint.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
    }
}

private struct SettingsRowDivider: View {
    var body: some View {
        Divider()
            .padding(.leading, 68)
    }
}

private enum MicrophonePermissionState {
    case allowed
    case off
    case notSet
    case unknown

    static var current: Self {
        if #available(iOS 17.0, *) {
            switch AVAudioApplication.shared.recordPermission {
            case .granted:
                return .allowed
            case .denied:
                return .off
            case .undetermined:
                return .notSet
            @unknown default:
                return .unknown
            }
        } else {
            switch AVAudioSession.sharedInstance().recordPermission {
            case .granted:
                return .allowed
            case .denied:
                return .off
            case .undetermined:
                return .notSet
            @unknown default:
                return .unknown
            }
        }
    }

    var label: String {
        switch self {
        case .allowed:
            return "Allowed"
        case .off:
            return "Off"
        case .notSet:
            return "Not set"
        case .unknown:
            return "Unknown"
        }
    }
}

private extension UserRole {
    var settingsLabel: String {
        rawValue.capitalized
    }
}

private extension String {
    var nonEmptyValue: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }

    var settingsStatusLabel: String {
        replacingOccurrences(of: "_", with: " ").capitalized
    }
}
