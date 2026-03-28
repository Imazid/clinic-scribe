import SwiftUI

enum CSBadgeVariant {
    case success, error, warning, info, `default`

    var backgroundColor: Color {
        switch self {
        case .success: return Theme.success.opacity(0.1)
        case .error: return Theme.error.opacity(0.1)
        case .warning: return Theme.warning.opacity(0.1)
        case .info: return Theme.secondary.opacity(0.1)
        case .default: return Theme.surfaceContainerHigh
        }
    }

    var foregroundColor: Color {
        switch self {
        case .success: return Theme.success
        case .error: return Theme.error
        case .warning: return Theme.warning
        case .info: return Theme.secondary
        case .default: return Theme.onSurfaceVariant
        }
    }
}

struct CSBadge: View {
    let text: String
    var variant: CSBadgeVariant = .default

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .foregroundStyle(variant.foregroundColor)
            .background(variant.backgroundColor)
            .clipShape(Capsule())
            .accessibilityLabel(text)
            .accessibilityAddTraits(.isStaticText)
    }
}
