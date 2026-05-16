import SwiftUI

/// `PatientTimelineView` — vertical visit history. Each entry is a date pill
/// + roomy card with type, status, and a chevron that drills into the
/// consultation. Matches the design package's `PatientTimeline` pattern.
struct PatientTimelineView: View {
    let consultations: [Consultation]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            HStack(spacing: 8) {
                Text("CONSULTATION HISTORY")
                    .font(.system(size: 11, weight: .bold))
                    .tracking(0.6)
                    .foregroundStyle(Theme.outline)
                Spacer()
                if !consultations.isEmpty {
                    Text("\(consultations.count) on file")
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
            .padding(.horizontal, 4)

            if consultations.isEmpty {
                emptyState
            } else {
                VStack(spacing: 10) {
                    ForEach(Array(consultations.enumerated()), id: \.element.id) { (i, c) in
                        TimelineEntry(
                            consultation: c,
                            isFirst: i == 0,
                            isLast: i == consultations.count - 1
                        )
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        CSCard {
            VStack(spacing: Theme.spacingSm) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.title2)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .accessibilityLabel("No consultation history")
                Text("No consultations yet")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.onSurface)
                Text("Start a consultation to begin building this patient's history.")
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.spacingSm)
        }
    }
}

private struct TimelineEntry: View {
    let consultation: Consultation
    let isFirst: Bool
    let isLast: Bool

    var body: some View {
        NavigationLink {
            ConsultationDetailView(consultationId: consultation.id)
        } label: {
            HStack(alignment: .top, spacing: 12) {
                // Rail with dot
                VStack(spacing: 0) {
                    Rectangle()
                        .fill(isFirst ? Color.clear : Theme.outlineVariant)
                        .frame(width: 1, height: 14)
                    ZStack {
                        Circle()
                            .fill(Theme.surface)
                            .frame(width: 14, height: 14)
                        Circle()
                            .stroke(Theme.secondary, lineWidth: 2)
                            .frame(width: 10, height: 10)
                        Circle()
                            .fill(Theme.secondary)
                            .frame(width: 5, height: 5)
                    }
                    Rectangle()
                        .fill(isLast ? Color.clear : Theme.outlineVariant)
                        .frame(width: 1)
                }
                .frame(width: 14)

                // Card
                HStack(alignment: .top, spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(consultation.consultationType)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(Theme.onSurface)
                            .lineLimit(1)
                        Text(DateFormatters.formatISO(consultation.startedAt))
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .lineLimit(1)
                    }

                    Spacer()

                    CSBadge(text: consultation.status.label, variant: consultation.status.badgeVariant)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Theme.outline)
                        .padding(.top, 2)
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: Theme.radiusMd)
                        .fill(Theme.surfaceContainerLowest)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusMd)
                        .strokeBorder(Theme.outlineVariant, lineWidth: 1)
                )
                .padding(.vertical, 2)
            }
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(consultation.consultationType), \(consultation.status.label), \(DateFormatters.formatISO(consultation.startedAt))")
    }
}
