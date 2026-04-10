import SwiftUI

struct RecentConsultationsCard: View {
    let consultations: [Consultation]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm + Theme.spacingXS) {
            Text("Recent Consultations")
                .font(.headline)
                .foregroundStyle(Theme.onSurface)

            if consultations.isEmpty {
                CSEmptyState(
                    icon: "stethoscope",
                    title: "No Consultations Yet",
                    description: "Start your first consultation to see it here"
                )
            } else {
                ForEach(consultations) { c in
                    NavigationLink {
                        RecentConsultationDestination(consultationId: c.id)
                    } label: {
                        HStack(spacing: Theme.spacingSm) {
                            CSAvatar(initials: c.patient?.initials ?? "?", size: 36)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(c.patient?.fullName ?? "Unknown")
                                    .font(.subheadline.weight(.medium))
                                    .foregroundStyle(Theme.onSurface)
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                Text(DateFormatters.formatISO(c.startedAt))
                                    .font(.caption)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                            }

                            Spacer(minLength: Theme.spacingXS)

                            CSBadge(text: c.status.label, variant: c.status.badgeVariant)
                                .fixedSize()
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("\(c.patient?.fullName ?? "Unknown"), \(c.status.label), \(DateFormatters.formatISO(c.startedAt))")
                    }

                    if c.id != consultations.last?.id {
                        Divider()
                    }
                }
            }
        }
        .cardStyle()
    }
}

private struct RecentConsultationDestination: View {
    let consultationId: UUID

    var body: some View {
        ConsultationDestinationRouter(consultationId: consultationId)
    }
}

private struct ConsultationDestinationRouter: View {
    let consultationId: UUID
    @StateObject private var vm = ConsultationDetailViewModel()

    var body: some View {
        Group {
            if let consultation = vm.consultation {
                switch consultation.status {
                case .recording, .transcribing, .generating:
                    ConsultationSessionWorkspaceView(consultationId: consultationId)
                case .reviewPending:
                    ConsultationVerifyLoaderView(consultationId: consultationId)
                default:
                    ConsultationDetailView(consultationId: consultationId)
                }
            } else {
                ProgressView("Loading consultation...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task { await vm.load(id: consultationId) }
    }
}
