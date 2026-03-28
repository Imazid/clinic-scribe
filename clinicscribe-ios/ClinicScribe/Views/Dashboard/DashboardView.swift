import SwiftUI

struct DashboardView: View {
    @StateObject private var vm = DashboardViewModel()
    @ObservedObject private var auth = AuthService.shared

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    // Greeting
                    Text("\(DateFormatters.timeGreeting()), \(auth.currentProfile?.firstName ?? vm.profile?.firstName ?? "Doctor")")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(Theme.primary)

                    if vm.isLoading {
                        // Loading skeleton
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.spacingMd) {
                            ForEach(0..<4, id: \.self) { _ in
                                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                                    RoundedRectangle(cornerRadius: Theme.radiusXS)
                                        .fill(Theme.surfaceContainerHigh)
                                        .frame(width: 36, height: 36)
                                    RoundedRectangle(cornerRadius: Theme.radiusXS)
                                        .fill(Theme.surfaceContainerHigh)
                                        .frame(width: 48, height: 28)
                                    RoundedRectangle(cornerRadius: Theme.radiusXS)
                                        .fill(Theme.surfaceContainerHigh)
                                        .frame(width: 80, height: 14)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .cardStyle()
                                .redacted(reason: .placeholder)
                            }
                        }

                        // Skeleton for recent consultations
                        VStack(alignment: .leading, spacing: Theme.spacingSm) {
                            RoundedRectangle(cornerRadius: Theme.radiusXS)
                                .fill(Theme.surfaceContainerHigh)
                                .frame(width: 180, height: 18)
                            ForEach(0..<3, id: \.self) { _ in
                                HStack(spacing: Theme.spacingSm) {
                                    Circle()
                                        .fill(Theme.surfaceContainerHigh)
                                        .frame(width: 36, height: 36)
                                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                                        RoundedRectangle(cornerRadius: Theme.radiusXS)
                                            .fill(Theme.surfaceContainerHigh)
                                            .frame(width: 120, height: 14)
                                        RoundedRectangle(cornerRadius: Theme.radiusXS)
                                            .fill(Theme.surfaceContainerHigh)
                                            .frame(width: 80, height: 12)
                                    }
                                    Spacer()
                                    RoundedRectangle(cornerRadius: Theme.radiusXS)
                                        .fill(Theme.surfaceContainerHigh)
                                        .frame(width: 60, height: 20)
                                }
                            }
                        }
                        .cardStyle()
                        .redacted(reason: .placeholder)
                    } else {
                        // Metrics
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.spacingMd) {
                            MetricCard(icon: "person.2", label: "Total Patients", value: "\(vm.totalPatients)")
                            MetricCard(icon: "stethoscope", label: "This Week", value: "\(vm.consultationsThisWeek)")
                            MetricCard(icon: "clock", label: "Avg Doc Time", value: "--")
                            MetricCard(icon: "exclamationmark.circle", label: "Pending Reviews", value: "\(vm.pendingReviews)", variant: vm.pendingReviews > 0 ? .warning : .default)
                        }

                        // Recent Consultations
                        if vm.recentConsultations.isEmpty {
                            CSEmptyState(
                                icon: "doc.text.magnifyingglass",
                                title: "No Recent Consultations",
                                description: "Start a new consultation to see it here."
                            )
                            .cardStyle()
                        } else {
                            RecentConsultationsCard(consultations: vm.recentConsultations)
                        }

                        // Quick Actions
                        VStack(alignment: .leading, spacing: Theme.spacingMd) {
                            Text("Quick Actions")
                                .font(.headline)
                                .foregroundStyle(Theme.onSurface)

                            HStack(spacing: Theme.spacingMd) {
                                NavigationLink {
                                    NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
                                } label: {
                                    CSButton(title: "New Consultation", variant: .secondary, size: .sm, isFullWidth: true) {}
                                        .allowsHitTesting(false)
                                        .overlay(alignment: .leading) {
                                            Image(systemName: "plus.circle.fill")
                                                .foregroundStyle(Theme.onSurface)
                                                .padding(.leading, Theme.spacingMd)
                                        }
                                }
                                .accessibilityLabel("New Consultation")
                                .accessibilityHint("Start a new patient consultation")

                                NavigationLink {
                                    PatientFormView(clinicId: auth.clinicId)
                                } label: {
                                    CSButton(title: "Add Patient", variant: .outline, size: .sm, isFullWidth: true) {}
                                        .allowsHitTesting(false)
                                        .overlay(alignment: .leading) {
                                            Image(systemName: "person.badge.plus")
                                                .foregroundStyle(Theme.primary)
                                                .padding(.leading, Theme.spacingMd)
                                        }
                                }
                                .accessibilityLabel("Add Patient")
                                .accessibilityHint("Register a new patient")
                            }
                        }
                    }
                }
                .padding(Theme.spacingMd)
            }
            .background(Theme.surface)
            .navigationTitle("Dashboard")
            .refreshable { await vm.load() }
            .task { await vm.load() }
        }
    }
}
