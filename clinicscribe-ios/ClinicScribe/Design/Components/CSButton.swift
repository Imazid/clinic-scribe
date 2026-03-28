import SwiftUI
import UIKit

enum CSButtonVariant {
    case primary, secondary, outline, ghost, danger
}

enum CSButtonSize {
    case sm, md, lg

    var verticalPadding: CGFloat {
        switch self {
        case .sm: return 8
        case .md: return 12
        case .lg: return 16
        }
    }

    var font: Font {
        switch self {
        case .sm: return .subheadline.weight(.semibold)
        case .md: return .body.weight(.semibold)
        case .lg: return .body.weight(.bold)
        }
    }
}

struct CSButtonStyle: ButtonStyle {
    let variant: CSButtonVariant
    let size: CSButtonSize
    let isFullWidth: Bool
    let isLoading: Bool
    let isDisabled: Bool
    let title: String

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.85 : 1.0)
            .animation(.easeInOut(duration: Theme.animationFast), value: configuration.isPressed)
    }

    var backgroundColor: Color {
        if isDisabled {
            return Theme.disabled
        }
        switch variant {
        case .primary: return Theme.primary
        case .secondary: return Theme.surfaceContainer
        case .outline: return .clear
        case .ghost: return .clear
        case .danger: return Theme.error
        }
    }

    var foregroundColor: Color {
        if isDisabled {
            return Theme.onDisabled
        }
        switch variant {
        case .primary: return Theme.onPrimary
        case .secondary: return Theme.onSurface
        case .outline: return Theme.primary
        case .ghost: return Theme.primary
        case .danger: return Theme.onPrimary
        }
    }
}

struct CSButton: View {
    let title: String
    var variant: CSButtonVariant = .primary
    var size: CSButtonSize = .md
    var isLoading: Bool = false
    var isFullWidth: Bool = true
    var isDisabled: Bool = false
    let action: () -> Void

    private var buttonStyle: CSButtonStyle {
        CSButtonStyle(
            variant: variant,
            size: size,
            isFullWidth: isFullWidth,
            isLoading: isLoading,
            isDisabled: isDisabled,
            title: title
        )
    }

    var body: some View {
        Button {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            action()
        } label: {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(buttonStyle.foregroundColor)
                }
                Text(title)
                    .font(size.font)
            }
            .frame(maxWidth: isFullWidth ? .infinity : nil)
            .padding(.vertical, size.verticalPadding)
            .padding(.horizontal, 20)
            .foregroundStyle(buttonStyle.foregroundColor)
            .background(buttonStyle.backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
            .overlay {
                if variant == .outline {
                    RoundedRectangle(cornerRadius: Theme.radiusMd)
                        .stroke(isDisabled ? Theme.disabled : Theme.outline, lineWidth: 1)
                }
            }
        }
        .buttonStyle(buttonStyle)
        .disabled(isLoading || isDisabled)
        .accessibilityLabel(title)
        .accessibilityAddTraits(.isButton)
    }
}
