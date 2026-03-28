import SwiftUI

struct PatientTimelineView: View {
    let consultations: [Consultation]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm + Theme.spacingXS) {
            Text("Consultation History")
                .font(.headline)
                .foregroundStyle(Theme.onSurface)

            if consultations.isEmpty {
                VStack(spacing: Theme.spacingSm) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.title2)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .accessibilityLabel("No consultation history")
                    Text("No consultations yet")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, Theme.spacingSm)
            } else {
                ForEach(consultations) { c in
                    HStack(spacing: Theme.spacingSm + Theme.spacingXS) {
                        Circle()
                            .fill(Theme.secondary)
                            .frame(width: Theme.spacingSm, height: Theme.spacingSm)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(c.consultationType)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(Theme.onSurface)
                            Text(DateFormatters.formatISO(c.startedAt))
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }

                        Spacer()

                        CSBadge(text: c.status.label, variant: c.status.badgeVariant)
                    }
                    .padding(.vertical, Theme.spacingXS)
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("\(c.consultationType), \(c.status.label), \(DateFormatters.formatISO(c.startedAt))")

                    if c.id != consultations.last?.id {
                        Divider().padding(.leading, Theme.spacingLg)
                    }
                }
            }
        }
        .cardStyle()
    }
}
