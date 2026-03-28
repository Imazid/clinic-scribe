import SwiftUI

struct CSProgressBar: View {
    let value: Double // 0.0 to 1.0
    var tint: Color = Theme.secondary

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: Theme.spacingXS)
                    .fill(Theme.surfaceContainerHigh)

                RoundedRectangle(cornerRadius: Theme.spacingXS)
                    .fill(tint)
                    .frame(width: geometry.size.width * min(max(value, 0), 1))
                    .animation(.easeInOut(duration: Theme.animationDefault), value: value)
            }
        }
        .frame(height: 6)
        .accessibilityLabel("Progress: \(Int(value * 100)) percent")
        .accessibilityValue("\(Int(value * 100))%")
    }
}
