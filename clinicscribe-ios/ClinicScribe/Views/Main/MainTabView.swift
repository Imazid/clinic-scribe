import SwiftUI

/// `MainTabView` — pixel-faithful to the design package's `IOSTabBar`:
/// floating pill tab bar that hovers above content with backdrop blur. Active
/// tab grows into a labeled chip; inactive tabs are icon-only.
struct MainTabView: View {
    @State private var selection: TabSlot = .prepare

    enum TabSlot: String, CaseIterable, Identifiable {
        case prepare, capture, verify, tasks, more

        var id: String { rawValue }
        var label: String {
            switch self {
            case .prepare: return "Prepare"
            case .capture: return "Capture"
            case .verify: return "Verify"
            case .tasks: return "Tasks"
            case .more: return "More"
            }
        }
        var systemImage: String {
            switch self {
            case .prepare: return "calendar.badge.clock"
            case .capture: return "mic.circle.fill"
            case .verify: return "checkmark.shield"
            case .tasks: return "tray.full"
            case .more: return "ellipsis"
            }
        }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            content
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .safeAreaInset(edge: .bottom, spacing: 0) {
                    Color.clear.frame(height: 56)
                }

            FloatingPillTabBar(selection: $selection)
                .padding(.horizontal, 16)
                .padding(.bottom, 6)
        }
        .background(Theme.surface)
    }

    @ViewBuilder
    private var content: some View {
        switch selection {
        case .prepare:
            NavigationStack { DashboardView() }
        case .capture:
            NavigationStack {
                ConsultationListView(
                    navigationTitle: "Capture",
                    helperText: "Live capture sessions and active consults are here first.",
                    defaultStatusFilter: .recording,
                    destinationMode: .sessionWorkspace
                )
            }
        case .verify:
            NavigationStack {
                ConsultationListView(
                    navigationTitle: "Verify",
                    helperText: "Review generated notes, verify outputs, and approve clinically safe drafts.",
                    defaultStatusFilter: .reviewPending,
                    destinationMode: .verify
                )
            }
        case .tasks:
            NavigationStack { TasksWorkspaceView() }
        case .more:
            NavigationStack { MoreView() }
        }
    }
}

private struct FloatingPillTabBar: View {
    @Binding var selection: MainTabView.TabSlot

    var body: some View {
        HStack(spacing: 4) {
            ForEach(MainTabView.TabSlot.allCases) { slot in
                let isActive = selection == slot
                Button {
                    withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                        selection = slot
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: slot.systemImage)
                            .font(.system(size: 15, weight: .semibold))
                        if isActive {
                            Text(slot.label)
                                .font(.system(size: 13, weight: .semibold))
                                .lineLimit(1)
                        }
                    }
                    .padding(.vertical, 10)
                    .padding(.horizontal, isActive ? 14 : 12)
                    .frame(minHeight: 40)
                    .frame(maxWidth: isActive ? .infinity : nil)
                    .foregroundStyle(isActive ? Theme.onPrimary : Theme.onSurfaceVariant)
                    .background(
                        Group {
                            if isActive {
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(Theme.primary)
                            } else {
                                Color.clear
                            }
                        }
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(slot.label)
                .accessibilityAddTraits(isActive ? [.isSelected] : [])
            }
        }
        .padding(6)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 26)
                    .fill(.ultraThinMaterial)
                RoundedRectangle(cornerRadius: 26)
                    .fill(Theme.surfaceContainerLowest.opacity(0.65))
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 26)
                .strokeBorder(Theme.outlineVariant.opacity(0.7), lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.10), radius: 18, y: 8)
        .shadow(color: Color.black.opacity(0.04), radius: 4, y: 1)
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
