import SwiftUI
import UIKit

struct CSFilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button {
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            action()
        } label: {
            Text(title)
                .font(.subheadline.weight(.medium))
                .padding(.horizontal, Theme.spacingSm + Theme.spacingXS)
                .padding(.vertical, Theme.spacingSm)
                .frame(minHeight: 36)
                .background(isSelected ? Theme.primary : Theme.surfaceContainerHigh)
                .foregroundStyle(isSelected ? Theme.onPrimary : Theme.onSurfaceVariant)
                .clipShape(Capsule())
        }
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityLabel("\(title) filter")
    }
}
