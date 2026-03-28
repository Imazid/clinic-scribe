import SwiftUI

struct NoteApprovalBar: View {
    let confidence: Double
    let isApproving: Bool
    let onApprove: () -> Void
    let onCopy: () -> Void

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            HStack(spacing: Theme.spacingXS) {
                Image(systemName: "brain.head.profile")
                    .font(.caption)
                    .accessibilityHidden(true)
                Text(String(format: "%.0f%%", confidence * 100))
                    .font(.subheadline.weight(.semibold))
            }
            .foregroundStyle(Theme.onSurfaceVariant)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Confidence \(Int(confidence * 100)) percent")

            Spacer()

            Button(action: onCopy) {
                Image(systemName: "doc.on.doc")
                    .padding(10)
                    .background(Theme.surfaceContainer)
                    .clipShape(Circle())
            }
            .foregroundStyle(Theme.onSurfaceVariant)
            .accessibilityLabel("Copy note to clipboard")

            Button(action: onApprove) {
                HStack(spacing: 6) {
                    if isApproving {
                        ProgressView().tint(Theme.onPrimary)
                    }
                    Text("Approve")
                        .font(.subheadline.weight(.semibold))
                }
                .padding(.horizontal, Theme.spacingLg)
                .padding(.vertical, 10)
                .background(Theme.success)
                .foregroundStyle(Theme.onPrimary)
                .clipShape(Capsule())
            }
            .disabled(isApproving)
            .accessibilityLabel(isApproving ? "Approving note" : "Approve note")
        }
        .padding(Theme.spacingMd)
        .background(Theme.surfaceContainerLowest)
        .shadow(color: Theme.shadowColorStrong, radius: 8, y: -2)
    }
}
