import SwiftUI

extension View {
    func cardStyle() -> some View {
        self
            .padding(Theme.spacingMd)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.surfaceContainerLowest)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
            .themeShadow(Theme.elevationMedium)
    }
}
