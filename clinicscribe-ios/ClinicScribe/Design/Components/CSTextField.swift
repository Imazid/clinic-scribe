import SwiftUI

struct CSTextField: View {
    let label: String
    @Binding var text: String
    var placeholder: String = ""
    var isSecure: Bool = false
    var errorMessage: String? = nil
    var keyboardType: UIKeyboardType = .default

    @FocusState private var isFocused: Bool

    private var borderColor: Color {
        if let _ = errorMessage {
            return Theme.error
        } else if isFocused {
            return Theme.primary
        } else {
            return Theme.outlineVariant
        }
    }

    private var borderWidth: CGFloat {
        if errorMessage != nil {
            return 1.5
        } else if isFocused {
            return 2
        } else {
            return 1
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.onSurface)

            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                        .focused($isFocused)
                } else {
                    TextField(placeholder, text: $text)
                        .keyboardType(keyboardType)
                        .focused($isFocused)
                }
            }
            .padding(.horizontal, Theme.spacingMd)
            .padding(.vertical, Theme.spacingSm + Theme.spacingXS)
            .background(Theme.surfaceContainerLow)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.radiusSm)
                    .stroke(borderColor, lineWidth: borderWidth)
            }

            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(Theme.error)
                    .accessibilityLabel("Error: \(error)")
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(isSecure ? "\(label), secure text field" : label)
    }
}
