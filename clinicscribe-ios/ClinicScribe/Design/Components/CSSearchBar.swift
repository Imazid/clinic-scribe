import SwiftUI

struct CSSearchBar: View {
    @Binding var text: String
    var placeholder: String = "Search..."

    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Theme.onSurfaceVariant)
                .accessibilityHidden(true)

            TextField(placeholder, text: $text)
                .font(.body)
                .focused($isFocused)

            if !text.isEmpty {
                Button {
                    withAnimation(.easeInOut(duration: Theme.animationFast)) {
                        text = ""
                    }
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
                .transition(.opacity.combined(with: .scale))
                .accessibilityLabel("Clear search")
            }
        }
        .padding(.horizontal, Theme.spacingSm + 6)
        .padding(.vertical, 10)
        .background(Theme.surfaceContainerLow)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.radiusSm)
                .stroke(isFocused ? Theme.primary : Color.clear, lineWidth: isFocused ? 2 : 0)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Search")
    }
}
