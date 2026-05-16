import SwiftUI

struct DashboardView: View {
    @StateObject private var vm = DashboardViewModel()
    @ObservedObject private var auth = AuthService.shared

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                heroStrip

                if vm.isLoading {
                    skeletonContent
                } else {
                    if vm.recentConsultations.isEmpty {
                        CSEmptyState(
                            icon: "doc.text.magnifyingglass",
                            title: "No recent consultations",
                            description: "Start a new consultation and it'll surface here as you go."
                        )
                        .cardStyle()
                    } else {
                        RecentConsultationsCard(consultations: vm.recentConsultations)
                    }

                    quickActionsSection
                }
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("Today")
        .refreshable { await vm.load() }
        .task { await vm.load() }
    }

    // MARK: - Hero

    private var heroStrip: some View {
        let firstName = auth.currentProfile?.firstName ?? vm.profile?.firstName ?? "Doctor"
        let pendingTone: CSStat.Tone = vm.pendingReviews > 0 ? .warning : .default
        let stats: [CSStat] = [
            CSStat(
                label: "This week",
                value: "\(vm.consultationsThisWeek)",
                sub: "Consultations",
                systemImage: "stethoscope"
            ),
            CSStat(
                label: "Pending review",
                value: "\(vm.pendingReviews)",
                sub: vm.pendingReviews == 0 ? "Clear" : "Awaiting sign-off",
                systemImage: "checkmark.shield",
                tone: pendingTone
            ),
            CSStat(
                label: "Patients",
                value: "\(vm.totalPatients)",
                sub: "Total",
                systemImage: "person.2"
            ),
            CSStat(
                label: "Status",
                value: "Active",
                sub: "Live signal",
                systemImage: "waveform",
                tone: .success
            ),
        ]

        return CSHeroStrip(
            eyebrow: DateFormatters.todayEyebrow().uppercased(),
            title: {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("\(DateFormatters.timeGreeting()),")
                    CSHeroAccent(firstName + ".")
                }
            },
            description: vm.pendingReviews > 0
                ? "\(vm.pendingReviews) note\(vm.pendingReviews == 1 ? "" : "s") need your sign-off. Nothing leaves the system without you."
                : "Inbox is clear. Nothing leaves the system without you.",
            stats: stats
        )
    }

    // MARK: - Skeleton

    @ViewBuilder
    private var skeletonContent: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            ForEach(0..<3, id: \.self) { _ in
                HStack(spacing: Theme.spacingSm) {
                    Circle().fill(Theme.surfaceContainerHigh).frame(width: 40, height: 40)
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Theme.surfaceContainerHigh)
                            .frame(width: 140, height: 14)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Theme.surfaceContainerHigh)
                            .frame(width: 90, height: 12)
                    }
                    Spacer()
                }
            }
        }
        .cardStyle()
        .redacted(reason: .placeholder)
    }

    // MARK: - Quick actions

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            Text("QUICK ACTIONS")
                .font(.system(size: 11, weight: .bold))
                .tracking(1.2)
                .foregroundStyle(Theme.outline)

            HStack(spacing: Theme.spacingMd) {
                NavigationLink {
                    NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
                } label: {
                    quickActionLabel(
                        title: "New consultation",
                        sub: "Record or upload a session",
                        systemImage: "mic.fill",
                        tint: Theme.primary,
                        background: Theme.primary,
                        foreground: Theme.onPrimary
                    )
                }
                .accessibilityLabel("New consultation")
                .accessibilityHint("Start a new patient consultation")

                NavigationLink {
                    PatientFormView(clinicId: auth.clinicId)
                } label: {
                    quickActionLabel(
                        title: "Add patient",
                        sub: "Create a new patient record",
                        systemImage: "person.badge.plus",
                        tint: Theme.secondary,
                        background: Theme.surfaceContainerLowest,
                        foreground: Theme.onSurface
                    )
                }
                .accessibilityLabel("Add patient")
                .accessibilityHint("Register a new patient")
            }
        }
    }

    private func quickActionLabel(
        title: String,
        sub: String,
        systemImage: String,
        tint: Color,
        background: Color,
        foreground: Color
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(background == Theme.primary
                          ? Color.white.opacity(0.12)
                          : Theme.secondaryFixed)
                    .frame(width: 36, height: 36)
                Image(systemName: systemImage)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(background == Theme.primary ? foreground : tint)
            }
            Text(title)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(foreground)
            Text(sub)
                .font(.system(size: 12))
                .foregroundStyle(background == Theme.primary
                                 ? foreground.opacity(0.7)
                                 : Theme.onSurfaceVariant)
        }
        .padding(Theme.spacingMd)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(background)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusMd)
                .strokeBorder(
                    background == Theme.primary ? Color.clear : Theme.outlineVariant,
                    lineWidth: 1
                )
        )
        .themeShadow(Theme.shadowAmbientSm)
    }
}

// MARK: - DateFormatters helper

extension DateFormatters {
    static func todayEyebrow() -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_AU")
        f.dateFormat = "EEEE · d MMMM"
        return f.string(from: Date())
    }
}
