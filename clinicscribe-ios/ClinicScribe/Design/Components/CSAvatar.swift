import SwiftUI

struct CSAvatar: View {
    let initials: String
    var size: CGFloat = 40
    var showBorder: Bool = false

    var body: some View {
        Text(initials.prefix(2).uppercased())
            .font(.system(size: size * 0.4, weight: .semibold, design: .rounded))
            .foregroundStyle(Theme.onPrimary)
            .frame(width: size, height: size)
            .background(Theme.primaryContainer)
            .clipShape(Circle())
            .overlay {
                if showBorder {
                    Circle()
                        .stroke(Theme.primary, lineWidth: 2)
                }
            }
            .accessibilityLabel("Avatar: \(initials)")
    }
}
