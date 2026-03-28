import SwiftUI
import UIKit

enum Theme {
    // MARK: - Adaptive Colors (light / dark)

    // Primary
    static let primary = Color.adaptive(light: "#001736", dark: "#B0C9E8")
    static let primaryContainer = Color.adaptive(light: "#002B5B", dark: "#1A3A5C")
    static let onPrimary = Color.adaptive(light: .white, dark: Color(hex: "#001736"))

    // Secondary
    static let secondary = Color.adaptive(light: "#006876", dark: "#58E6FF")
    static let secondaryContainer = Color.adaptive(light: "#58E6FF", dark: "#004F5A")
    static let secondaryFixed = Color.adaptive(light: "#A1EFFF", dark: "#003D47")

    // Tertiary
    static let tertiary = Color.adaptive(light: "#011A24", dark: "#A0C4D4")
    static let tertiaryContainer = Color.adaptive(light: "#172F39", dark: "#1E3640")

    // Surfaces
    static let surface = Color.adaptive(light: "#FCF9F4", dark: "#121212")
    static let surfaceContainerLowest = Color.adaptive(light: .white, dark: Color(hex: "#1A1A1A"))
    static let surfaceContainerLow = Color.adaptive(light: "#F6F3EE", dark: "#1E1E1E")
    static let surfaceContainer = Color.adaptive(light: "#F0EDE8", dark: "#252525")
    static let surfaceContainerHigh = Color.adaptive(light: "#EAE7E2", dark: "#2C2C2C")
    static let surfaceContainerHighest = Color.adaptive(light: "#E5E2DD", dark: "#333333")

    // On Surface
    static let onSurface = Color.adaptive(light: "#1C1C19", dark: "#E4E2DD")
    static let onSurfaceVariant = Color.adaptive(light: "#43474F", dark: "#C4C6D0")

    // Outline
    static let outline = Color.adaptive(light: "#747780", dark: "#8E9099")
    static let outlineVariant = Color.adaptive(light: "#C4C6D0", dark: "#44464F")

    // Semantic
    static let error = Color.adaptive(light: "#BA1A1A", dark: "#FFB4AB")
    static let errorContainer = Color.adaptive(light: "#FFDAD6", dark: "#93000A")
    static let success = Color.adaptive(light: "#2E7D32", dark: "#81C784")
    static let successContainer = Color.adaptive(light: "#C8E6C9", dark: "#1B5E20")
    static let warning = Color.adaptive(light: "#C98600", dark: "#FFD54F")
    static let warningContainer = Color.adaptive(light: "#FFEDB3", dark: "#5C4000")

    // MARK: - Shadows
    static let shadowColor = Color.adaptive(
        light: Color(hex: "#002B5B").opacity(0.04),
        dark: Color.black.opacity(0.3)
    )
    static let shadowColorMedium = Color.adaptive(
        light: Color(hex: "#002B5B").opacity(0.06),
        dark: Color.black.opacity(0.4)
    )
    static let shadowColorStrong = Color.adaptive(
        light: Color.black.opacity(0.08),
        dark: Color.black.opacity(0.5)
    )

    // MARK: - Corner Radii
    static let radiusXS: CGFloat = 6
    static let radiusSm: CGFloat = 8
    static let radiusMd: CGFloat = 16
    static let radiusLg: CGFloat = 24
    static let radiusXL: CGFloat = 32

    // MARK: - Spacing
    static let spacingXS: CGFloat = 4
    static let spacingSm: CGFloat = 8
    static let spacingMd: CGFloat = 16
    static let spacingLg: CGFloat = 24
    static let spacingXL: CGFloat = 32

    // MARK: - Elevation
    static let elevationLow = Shadow(color: shadowColor, radius: 4, y: 2)
    static let elevationMedium = Shadow(color: shadowColor, radius: 8, y: 4)
    static let elevationHigh = Shadow(color: shadowColorMedium, radius: 16, y: 8)

    struct Shadow {
        let color: Color
        let radius: CGFloat
        let y: CGFloat
    }

    // MARK: - Animation Timing
    static let animationFast: Double = 0.15
    static let animationDefault: Double = 0.25
    static let animationSlow: Double = 0.4

    // MARK: - Disabled State
    static let disabled = Color.adaptive(light: "#C4C6D0", dark: "#44464F")
    static let onDisabled = Color.adaptive(light: "#8E9099", dark: "#8E9099")

    // MARK: - Scrim
    static let scrim = Color.black.opacity(0.32)
}

// MARK: - Adaptive Color Helpers

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)

        let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000FF) / 255.0

        self.init(red: r, green: g, blue: b)
    }

    /// Creates a color that adapts to the current color scheme.
    static func adaptive(light: String, dark: String) -> Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: dark))
                : UIColor(Color(hex: light))
        })
    }

    static func adaptive(light: Color, dark: Color) -> Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(dark)
                : UIColor(light)
        })
    }
}

// MARK: - Shadow View Modifier

extension View {
    func themeShadow(_ shadow: Theme.Shadow) -> some View {
        self.shadow(color: shadow.color, radius: shadow.radius, y: shadow.y)
    }

    func cardStyle(padding: CGFloat = Theme.spacingMd) -> some View {
        self
            .padding(padding)
            .background(Theme.surfaceContainerLow)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
            .themeShadow(Theme.elevationLow)
    }
}
