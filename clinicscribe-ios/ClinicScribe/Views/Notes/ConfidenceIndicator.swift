import SwiftUI

struct ConfidenceIndicator: View {
    let scores: ConfidenceScores

    private func color(for score: Double) -> Color {
        if score >= AppConfig.confidenceThresholdHigh { return Theme.success }
        if score >= AppConfig.confidenceThresholdMedium { return Theme.warning }
        return Theme.error
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            HStack {
                Text("Confidence")
                    .font(.headline)
                    .foregroundStyle(Theme.onSurface)
                Spacer()
                Text(String(format: "%.0f%%", scores.overall * 100))
                    .font(.title3.weight(.bold))
                    .foregroundStyle(color(for: scores.overall))
                    .accessibilityLabel("Overall confidence \(String(format: "%.0f", scores.overall * 100)) percent")
            }
            .accessibilityElement(children: .combine)

            HStack(spacing: Theme.spacingMd) {
                ConfidenceBar(label: "S", value: scores.subjective, color: color(for: scores.subjective))
                ConfidenceBar(label: "O", value: scores.objective, color: color(for: scores.objective))
                ConfidenceBar(label: "A", value: scores.assessment, color: color(for: scores.assessment))
                ConfidenceBar(label: "P", value: scores.plan, color: color(for: scores.plan))
            }
        }
        .cardStyle()
    }
}

struct ConfidenceBar: View {
    let label: String
    let value: Double
    let color: Color

    var body: some View {
        VStack(spacing: Theme.spacingXS) {
            Text(label)
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.onSurfaceVariant)
            CSProgressBar(value: value, tint: color)
            Text(String(format: "%.0f%%", value * 100))
                .font(.caption2)
                .foregroundStyle(Theme.onSurfaceVariant)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label) confidence \(String(format: "%.0f", value * 100)) percent")
    }
}
