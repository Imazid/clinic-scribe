import SwiftUI
import UIKit

/// Design tokens — kept in lockstep with the web's `miraa-tokens.css`
/// (warm cream surfaces, espresso primary, slate-blue secondary, turquoise
/// tertiary). Updates here MUST be mirrored in
/// `clinicscribe-app/src/app/globals.css`.
enum Theme {
    // MARK: - Adaptive Colors (light / dark)

    // Primary (Espresso Ink — clinical trust)
    static let primary = Color.adaptive(light: "#1F1A14", dark: "#F5EFE3")
    static let primaryContainer = Color.adaptive(light: "#3A2E22", dark: "#2D2620")
    static let primaryLight = Color.adaptive(light: "#6B5848", dark: "#A89A87")
    static let onPrimary = Color.adaptive(light: "#FCF9F4", dark: "#1F1A14")

    // Secondary (Slate Blue — modern clinical signature)
    static let secondary = Color.adaptive(light: "#2F5A7A", dark: "#A8C7DD")
    static let secondaryContainer = Color.adaptive(light: "#C8DCEA", dark: "#3D5A78")
    static let secondaryFixed = Color.adaptive(light: "#E4EEF5", dark: "#2A4256")
    static let secondaryFixedDim = Color.adaptive(light: "#6FA1C2", dark: "#4F7795")
    static let onSecondary = Color.white

    // Tertiary (Turquoise — editorial accent)
    static let tertiary = Color.adaptive(light: "#2E9A93", dark: "#7DD3CB")
    static let tertiaryContainer = Color.adaptive(light: "#C5E6E3", dark: "#1F5C58")

    // Surfaces (Warm Cream → Bone)
    static let surface = Color.adaptive(light: "#FCF9F4", dark: "#161412")
    static let surfaceDim = Color.adaptive(light: "#E8E2D6", dark: "#1F1C19")
    static let surfaceContainerLowest = Color.adaptive(light: "#FFFFFF", dark: "#1A1816")
    static let surfaceContainerLow = Color.adaptive(light: "#F6F1E8", dark: "#1E1B18")
    static let surfaceContainer = Color.adaptive(light: "#F0EADD", dark: "#252220")
    static let surfaceContainerHigh = Color.adaptive(light: "#EBE3D2", dark: "#2C2925")
    static let surfaceContainerHighest = Color.adaptive(light: "#E5DCC7", dark: "#33302B")

    // On-surface / outline
    static let onSurface = Color.adaptive(light: "#1F1A14", dark: "#F3EEE3")
    static let onSurfaceVariant = Color.adaptive(light: "#5C5247", dark: "#C8BFB1")
    static let outline = Color.adaptive(light: "#8B7F70", dark: "#9C9080")
    static let outlineVariant = Color.adaptive(light: "#D8CFBE", dark: "#3F3A33")
    static let inverseSurface = Color.adaptive(light: "#2D2620", dark: "#F3EEE3")
    static let inverseOnSurface = Color.adaptive(light: "#F3EEE3", dark: "#2D2620")

    // Semantic
    static let error = Color.adaptive(light: "#B83A26", dark: "#FFB4AB")
    static let errorContainer = Color.adaptive(light: "#FBD8CF", dark: "#7C2618")
    static let success = Color.adaptive(light: "#4F7A3A", dark: "#A6D293")
    static let successContainer = Color.adaptive(light: "#DCEAC6", dark: "#365A26")
    static let warning = Color.adaptive(light: "#C98600", dark: "#FFD27A")
    static let warningContainer = Color.adaptive(light: "#FFEDB3", dark: "#5C4000")

    // MARK: - Shadows (warm, espresso-tinted)

    static let shadowAmbientSm = Shadow(
        color: Color(red: 0.227, green: 0.180, blue: 0.133).opacity(0.04),
        radius: 10, y: 4
    )
    static let shadowAmbient = Shadow(
        color: Color(red: 0.227, green: 0.180, blue: 0.133).opacity(0.06),
        radius: 20, y: 10
    )
    static let shadowAmbientLg = Shadow(
        color: Color(red: 0.227, green: 0.180, blue: 0.133).opacity(0.08),
        radius: 30, y: 15
    )

    // Legacy aliases (kept so existing call sites keep compiling)
    static let elevationLow = shadowAmbientSm
    static let elevationMedium = shadowAmbient
    static let elevationHigh = shadowAmbientLg
    static let shadowColor = shadowAmbientSm.color
    static let shadowColorMedium = shadowAmbient.color
    static let shadowColorStrong = shadowAmbientLg.color

    // MARK: - Corner Radii
    static let radiusXS: CGFloat = 6
    static let radiusSm: CGFloat = 8
    static let radiusMd: CGFloat = 16
    static let radiusLg: CGFloat = 24
    static let radiusXL: CGFloat = 32
    static let radius2XL: CGFloat = 48

    // MARK: - Spacing (4-pt scale)
    static let spacingXS: CGFloat = 4
    static let spacingSm: CGFloat = 8
    static let spacingMd: CGFloat = 16
    static let spacingLg: CGFloat = 24
    static let spacingXL: CGFloat = 32
    static let spacing2XL: CGFloat = 48

    // MARK: - Animation Timing
    static let animationFast: Double = 0.15
    static let animationDefault: Double = 0.25
    static let animationSlow: Double = 0.4

    // MARK: - Disabled / Scrim
    static let disabled = Color.adaptive(light: "#D8CFBE", dark: "#3F3A33")
    static let onDisabled = Color.adaptive(light: "#8B7F70", dark: "#9C9080")
    static let scrim = Color.black.opacity(0.32)

    struct Shadow {
        let color: Color
        let radius: CGFloat
        let y: CGFloat
    }
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

// MARK: - View Modifiers

extension View {
    /// Apply one of the project's named ambient shadows (warm tint).
    func themeShadow(_ shadow: Theme.Shadow) -> some View {
        self.shadow(color: shadow.color, radius: shadow.radius, y: shadow.y)
    }

    /// Soft white-on-cream card matching the web `<Card>` default variant.
    func cardStyle(padding: CGFloat = Theme.spacingMd) -> some View {
        self
            .padding(padding)
            .background(Theme.surfaceContainerLowest)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
            .themeShadow(Theme.shadowAmbientSm)
    }

    /// Mesh background — soft warm gradient + two blurred radial blobs.
    /// Mirrors the web `.mesh-bg` utility class.
    func meshBackground() -> some View {
        self.background(
            ZStack {
                LinearGradient(
                    colors: [Theme.surfaceContainerLowest, Theme.surfaceContainerLow],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                Circle()
                    .fill(Theme.secondaryFixed.opacity(0.45))
                    .frame(width: 280, height: 280)
                    .blur(radius: 80)
                    .offset(x: 90, y: -120)
                Circle()
                    .fill(Theme.tertiaryContainer.opacity(0.45))
                    .frame(width: 280, height: 280)
                    .blur(radius: 80)
                    .offset(x: -100, y: 140)
            }
            .clipped()
        )
    }
}

// MARK: - Text helpers

extension Text {
    /// Editorial italic accent — Fraunces italic 500 — for highlight words
    /// inside headlines. Falls back to the system serif italic if Fraunces
    /// isn't bundled yet.
    func serifItalic() -> Text {
        self
            .font(.custom("Fraunces-Italic", size: UIFont.preferredFont(forTextStyle: .title1).pointSize, relativeTo: .title))
            .italic()
            .foregroundColor(Theme.secondary)
    }

    /// All-caps eyebrow label.
    func eyebrow() -> some View {
        self
            .font(.system(size: 11, weight: .bold))
            .tracking(1.4)
            .textCase(.uppercase)
            .foregroundColor(Theme.secondary)
    }
}
