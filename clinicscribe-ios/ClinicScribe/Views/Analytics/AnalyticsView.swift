import SwiftUI
import Charts

struct AnalyticsView: View {
    @StateObject private var vm = AnalyticsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if vm.totalConsultations == 0 && vm.consultationsByType.isEmpty {
                    CSEmptyState(
                        icon: "chart.bar.xaxis",
                        title: "No Analytics Data",
                        description: "Analytics will appear here once consultations have been recorded.",
                        actionTitle: "Refresh"
                    ) {
                        Task {
                            if let clinicId = AuthService.shared.currentProfile?.clinicId {
                                await vm.load(clinicId: clinicId)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        VStack(spacing: Theme.spacingMd) {
                            summaryCards
                            consultationsByTypeChart
                        }
                        .padding()
                    }
                    .refreshable {
                        if let clinicId = AuthService.shared.currentProfile?.clinicId {
                            await vm.load(clinicId: clinicId)
                        }
                    }
                }
            }
            .background(Theme.surface)
            .navigationTitle("Analytics")
        }
        .task {
            if let clinicId = AuthService.shared.currentProfile?.clinicId {
                await vm.load(clinicId: clinicId)
            }
        }
    }

    private var summaryCards: some View {
        VStack(spacing: Theme.spacingSm + Theme.spacingXS) {
            HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                StatCard(
                    label: "Total Consultations",
                    value: "\(vm.totalConsultations)",
                    icon: "stethoscope",
                    iconColor: Theme.secondary
                )
                StatCard(
                    label: "Approved Notes",
                    value: "\(vm.approvedNotes)",
                    icon: "checkmark.seal",
                    iconColor: Theme.success
                )
            }

            StatCard(
                label: "Approval Rate",
                value: String(format: "%.1f%%", vm.approvalRate),
                icon: "chart.line.uptrend.xyaxis",
                iconColor: Theme.primary
            )
        }
    }

    @ViewBuilder
    private var consultationsByTypeChart: some View {
        if !vm.consultationsByType.isEmpty {
            VStack(alignment: .leading, spacing: Theme.spacingSm + Theme.spacingXS) {
                Text("Consultations by Type")
                    .font(.headline)
                    .foregroundStyle(Theme.onSurface)

                Chart(vm.consultationsByType) { stat in
                    BarMark(
                        x: .value("Type", stat.type.capitalized),
                        y: .value("Count", stat.count)
                    )
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Theme.secondary, Theme.tertiary],
                            startPoint: .bottom,
                            endPoint: .top
                        )
                    )
                    .cornerRadius(Theme.radiusXS)
                }
                .frame(height: 200)
                .chartYAxis {
                    AxisMarks(values: .automatic(desiredCount: 5))
                }
            }
            .cardStyle()
        }
    }
}

private struct StatCard: View {
    let label: String
    let value: String
    let icon: String
    var iconColor: Color = Theme.secondary

    var body: some View {
        HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(iconColor)
                .frame(width: 36, height: 36)
                .background(
                    Circle()
                        .fill(iconColor.opacity(0.12))
                )
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(Theme.onSurface)
                Text(label)
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
            }

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
        .cardStyle()
    }
}
