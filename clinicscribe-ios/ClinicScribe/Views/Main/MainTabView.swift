import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                DashboardView()
            }
            .tabItem { Label("Prepare", systemImage: "calendar.badge.clock") }

            NavigationStack {
                ConsultationListView(
                    navigationTitle: "Capture",
                    helperText: "Live capture sessions and active consults are here first.",
                    defaultStatusFilter: .recording,
                    destinationMode: .sessionWorkspace
                )
            }
            .tabItem { Label("Capture", systemImage: "mic.circle") }

            NavigationStack {
                ConsultationListView(
                    navigationTitle: "Verify",
                    helperText: "Review generated notes, verify outputs, and approve clinically safe drafts.",
                    defaultStatusFilter: .reviewPending,
                    destinationMode: .verify
                )
            }
            .tabItem { Label("Verify", systemImage: "checklist") }

            NavigationStack {
                TasksWorkspaceView()
            }
            .tabItem { Label("Tasks", systemImage: "tray.full") }

            NavigationStack {
                MoreView()
            }
            .tabItem { Label("More", systemImage: "ellipsis") }
        }
        .tint(Theme.secondary)
    }
}

struct MoreView: View {
    @ObservedObject private var auth = AuthService.shared
    @State private var showSignOutConfirmation = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: Theme.spacingLg) {
                if let profile = auth.currentProfile {
                    HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                        CSAvatar(initials: profile.initials, size: 44)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(profile.fullName)
                                .font(.headline)
                                .foregroundStyle(Theme.onSurface)

                            Text(
                                profile.specialty?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false
                                    ? profile.specialty ?? profile.role.rawValue.capitalized
                                    : profile.role.rawValue.capitalized
                            )
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }

                        Spacer()
                    }
                    .padding(Theme.spacingMd)
                    .background(Theme.surfaceContainerLowest)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    .themeShadow(Theme.elevationLow)
                }

                MoreSection(title: "Account") {
                    MoreMenuLinkRow(icon: "person.2", iconColor: Theme.success, title: "Patients") {
                        PatientListView()
                    }

                    MoreRowDivider()

                    MoreMenuLinkRow(icon: "gearshape", iconColor: Theme.secondary, title: "Settings") {
                        SettingsView()
                    }

                    MoreRowDivider()

                    MoreMenuLinkRow(icon: "person.crop.circle", iconColor: Theme.primary, title: "Profile") {
                        ProfileSettingsScreen()
                    }

                    MoreRowDivider()

                    MoreMenuLinkRow(icon: "doc.text", iconColor: Theme.secondary, title: "My Templates") {
                        TemplatesWorkspaceView()
                    }
                }

                MoreSection(title: "Workspace") {
                    MoreMenuLinkRow(icon: "chart.bar.xaxis", iconColor: Theme.warning, title: "Analytics") {
                        AnalyticsView()
                    }

                    MoreRowDivider()

                    MoreMenuLinkRow(icon: "link", iconColor: Theme.success, title: "Integrations") {
                        IntegrationsView()
                    }

                    MoreRowDivider()

                    MoreMenuLinkRow(icon: "lock.doc", iconColor: Theme.primary, title: "Legal & Privacy") {
                        LegalHubView()
                    }

                    MoreRowDivider()

                    MoreMenuLinkRow(
                        icon: "pills",
                        iconColor: Theme.warning,
                        title: "Prescriptions",
                        badgeText: "Soon"
                    ) {
                        PrescriptionsComingSoonView()
                    }
                }

                Button {
                    showSignOutConfirmation = true
                } label: {
                    HStack {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .font(.body)
                        Text("Sign Out")
                            .font(.body.weight(.medium))
                    }
                    .foregroundStyle(Theme.error)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.spacingSm + Theme.spacingXS)
                }
                .background(Theme.surfaceContainerLowest)
                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                .themeShadow(Theme.elevationLow)
                .alert("Sign Out", isPresented: $showSignOutConfirmation) {
                    Button("Cancel", role: .cancel) {}
                    Button("Sign Out", role: .destructive) {
                        Task { try? await AuthService.shared.signOut() }
                    }
                } message: {
                    Text("Are you sure you want to sign out?")
                }
            }
            .padding(Theme.spacingLg)
        }
        .background(Theme.surface)
        .navigationTitle("More")
    }
}

private struct ProfileSettingsScreen: View {
    @StateObject private var vm = SettingsViewModel()

    var body: some View {
        ProfileSettingsView(vm: vm)
    }
}

private struct MoreSection<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.onSurfaceVariant)
                .padding(.horizontal, Theme.spacingXS)

            VStack(spacing: 0) {
                content
            }
            .background(Theme.surfaceContainerLowest)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
            .themeShadow(Theme.elevationLow)
        }
    }
}

private struct MoreRowDivider: View {
    var body: some View {
        Divider()
            .padding(.leading, 52)
    }
}

private struct PrescriptionsComingSoonView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                CSEmptyState(
                    icon: "pills.fill",
                    title: "Prescriptions are coming soon",
                    description: "Ready-to-review prescription drafts and prescribing workflows will appear here once the prescribing module is enabled."
                )
                .frame(maxWidth: .infinity)
                .cardStyle()

                CSCard {
                    VStack(alignment: .leading, spacing: Theme.spacingSm) {
                        HStack {
                            Text("Planned")
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, Theme.spacingSm)
                                .padding(.vertical, Theme.spacingXS)
                                .background(Theme.surfaceContainer)
                                .foregroundStyle(Theme.outline)
                                .clipShape(Capsule())
                            Spacer()
                        }

                        Text("What will land here")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)

                        Text("Prescription drafts will be generated from approved notes, medication changes, and follow-up context so clinicians can review before sending them downstream.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)

                        VStack(alignment: .leading, spacing: Theme.spacingXS) {
                            prescriptionBullet("Draft scripts from medication changes in the approved note")
                            prescriptionBullet("Keep patient instructions aligned with the prescribed plan")
                            prescriptionBullet("Prepare eRx-ready handoff once integrations are enabled")
                        }
                    }
                }
            }
            .padding(Theme.spacingLg)
        }
        .background(Theme.surface)
        .navigationTitle("Prescriptions")
    }

    private func prescriptionBullet(_ text: String) -> some View {
        HStack(alignment: .top, spacing: Theme.spacingSm) {
            Image(systemName: "checkmark.circle.fill")
                .font(.caption)
                .foregroundStyle(Theme.secondary)
                .padding(.top, 2)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(Theme.onSurface)
        }
    }
}

private struct MoreMenuLinkRow<Destination: View>: View {
    let icon: String
    let iconColor: Color
    let title: String
    var badgeText: String? = nil
    let destination: Destination

    init(
        icon: String,
        iconColor: Color,
        title: String,
        badgeText: String? = nil,
        @ViewBuilder destination: () -> Destination
    ) {
        self.icon = icon
        self.iconColor = iconColor
        self.title = title
        self.badgeText = badgeText
        self.destination = destination()
    }

    var body: some View {
        NavigationLink {
            destination
        } label: {
            HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                Image(systemName: icon)
                    .font(.body)
                    .foregroundStyle(.white)
                    .frame(width: 32, height: 32)
                    .background(iconColor)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusXS))

                Text(title)
                    .font(.body)
                    .foregroundStyle(Theme.onSurface)

                if let badgeText {
                    Text(badgeText)
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(Theme.warning)
                        .padding(.horizontal, Theme.spacingSm)
                        .padding(.vertical, Theme.spacingXS)
                        .background(Theme.warningContainer.opacity(0.65))
                        .clipShape(Capsule())
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)
            }
            .padding(.horizontal, Theme.spacingMd)
            .padding(.vertical, Theme.spacingSm + Theme.spacingXS)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(title)
    }
}
