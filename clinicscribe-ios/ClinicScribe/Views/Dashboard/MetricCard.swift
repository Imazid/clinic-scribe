import SwiftUI

enum MetricCardVariant {
    case `default`, warning
}

struct MetricCard: View {
    let icon: String
    let label: String
    let value: String
    var variant: MetricCardVariant = .default

    private var iconColor: Color {
        variant == .warning ? Theme.warning : Theme.secondary
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            // Icon with background circle
            ZStack {
                Circle()
                    .fill(iconColor.opacity(0.12))
                    .frame(width: 36, height: 36)

                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(iconColor)
            }

            Text(value)
                .font(.title2.weight(.bold))
                .minimumScaleFactor(0.7)
                .foregroundStyle(Theme.onSurface)

            Text(label)
                .font(.caption)
                .foregroundStyle(Theme.onSurfaceVariant)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }
}
