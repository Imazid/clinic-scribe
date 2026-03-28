import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "square.grid.2x2") }

            PatientListView()
                .tabItem { Label("Patients", systemImage: "person.2") }

            ConsultationListView()
                .tabItem { Label("Consults", systemImage: "stethoscope") }

            AnalyticsView()
                .tabItem { Label("Analytics", systemImage: "chart.bar") }

            MoreView()
                .tabItem { Label("More", systemImage: "ellipsis") }
        }
        .tint(Theme.secondary)
    }
}

struct MoreView: View {
    @ObservedObject private var auth = AuthService.shared
    @State private var showSignOutConfirmation = false

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.spacingLg) {
                // MARK: - Clinic Header
                if let profile = auth.currentProfile {
                    HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                        CSAvatar(initials: profile.initials, size: 44)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(profile.fullName)
                                .font(.headline)
                                .foregroundStyle(Theme.onSurface)
                            if let specialty = profile.specialty, !specialty.isEmpty {
                                Text(specialty)
                                    .font(.caption)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                            }
                        }

                        Spacer()
                    }
                    .padding(Theme.spacingMd)
                    .background(Theme.surfaceContainerLowest)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    .themeShadow(Theme.elevationLow)
                }

                // MARK: - Account Section
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    Text("Account")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .padding(.horizontal, Theme.spacingXS)

                    VStack(spacing: 0) {
                        MoreMenuRow(
                            icon: "gearshape",
                            iconColor: Theme.secondary,
                            title: "Settings",
                            destination: AnyView(SettingsView())
                        )

                        Divider()
                            .padding(.leading, 52)

                        MoreMenuRow(
                            icon: "person.crop.circle",
                            iconColor: Theme.primary,
                            title: "Profile",
                            destination: AnyView(ProfileSettingsView(vm: SettingsViewModel()))
                        )
                    }
                    .background(Theme.surfaceContainerLowest)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    .themeShadow(Theme.elevationLow)
                }

                // MARK: - Administration Section
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    Text("Administration")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .padding(.horizontal, Theme.spacingXS)

                    VStack(spacing: 0) {
                        MoreMenuRow(
                            icon: "clipboard",
                            iconColor: Theme.warning,
                            title: "Audit Log",
                            destination: AnyView(AuditLogView())
                        )

                        Divider()
                            .padding(.leading, 52)

                        MoreMenuRow(
                            icon: "link",
                            iconColor: Theme.success,
                            title: "Integrations",
                            destination: AnyView(IntegrationsView())
                        )
                    }
                    .background(Theme.surfaceContainerLowest)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    .themeShadow(Theme.elevationLow)
                }

                // MARK: - Sign Out
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

// MARK: - MoreMenuRow

private struct MoreMenuRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let destination: AnyView

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

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)
            }
            .padding(.horizontal, Theme.spacingMd)
            .padding(.vertical, Theme.spacingSm + Theme.spacingXS)
            .contentShape(Rectangle())
        }
        .accessibilityLabel(title)
    }
}
