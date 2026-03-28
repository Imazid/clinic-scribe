import SwiftUI

struct CSEmptyState: View {
    let icon: String
    let title: String
    let description: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    @State private var appeared = false

    var body: some View {
        VStack(spacing: Theme.spacingMd) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundStyle(Theme.outlineVariant)
                .accessibilityHidden(true)

            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(Theme.onSurface)

            Text(description)
                .font(.subheadline)
                .foregroundStyle(Theme.onSurfaceVariant)
                .multilineTextAlignment(.center)

            if let actionTitle, let action {
                CSButton(title: actionTitle, size: .sm, isFullWidth: false, action: action)
                    .padding(.top, Theme.spacingSm)
            }
        }
        .padding(Theme.spacingXL)
        .accessibilityElement(children: .combine)
        .opacity(appeared ? 1 : 0)
        .animation(.easeIn(duration: Theme.animationDefault), value: appeared)
        .onAppear { appeared = true }
    }
}
