import SwiftUI

enum CardVariant {
    case elevated, filled, outlined
}

struct CSCard<Content: View>: View {
    var padding: CGFloat = Theme.spacingMd
    var variant: CardVariant = .elevated
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            content()
        }
        .padding(padding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
        .overlay {
            if variant == .outlined {
                RoundedRectangle(cornerRadius: Theme.radiusMd)
                    .stroke(Theme.outlineVariant, lineWidth: 1)
            }
        }
        .modifier(CardShadowModifier(variant: variant))
    }

    private var cardBackground: Color {
        switch variant {
        case .elevated:
            return Theme.surfaceContainerLowest
        case .filled:
            return Theme.surfaceContainerLow
        case .outlined:
            return .clear
        }
    }
}

private struct CardShadowModifier: ViewModifier {
    let variant: CardVariant

    func body(content: Content) -> some View {
        if variant == .elevated {
            content.themeShadow(Theme.elevationMedium)
        } else {
            content
        }
    }
}
