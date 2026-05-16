import SwiftUI

/// A statistic tile rendered inside `CSHeroStrip` (and reusable elsewhere).
struct CSStat: Identifiable {
    let id = UUID()
    let label: String
    let value: String
    let sub: String?
    let systemImage: String
    /// Tint applied to the icon and (subtly) the value.
    var tone: Tone = .default

    enum Tone {
        case `default`, warning, error, success, info

        var iconColor: Color {
            switch self {
            case .default: return Theme.secondary
            case .warning: return Theme.warning
            case .error: return Theme.error
            case .success: return Theme.success
            case .info: return Theme.secondary
            }
        }
    }
}

/// Editorial-italic accent word inside a hero headline. Matches the web
/// `<HeroAccent>` component (Fraunces italic in slate blue).
struct CSHeroAccent: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text).serifItalic()
    }
}

/// `CSHeroStrip` — warm `mesh-bg` panel that anchors every primary screen.
/// Matches the web `<HeroStrip>` component: eyebrow + headline + description
/// + optional stat tiles + optional action row.
struct CSHeroStrip<Title: View, Actions: View>: View {
    let eyebrow: String?
    let title: Title
    let description: String?
    var stats: [CSStat] = []
    let actions: Actions?

    init(
        eyebrow: String? = nil,
        @ViewBuilder title: () -> Title,
        description: String? = nil,
        stats: [CSStat] = [],
        @ViewBuilder actions: () -> Actions
    ) {
        self.eyebrow = eyebrow
        self.title = title()
        self.description = description
        self.stats = stats
        self.actions = actions()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingLg) {
            HStack(alignment: .top, spacing: Theme.spacingMd) {
                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    if let eyebrow {
                        Text(eyebrow).eyebrow()
                    }
                    title
                        .font(.system(size: 28, weight: .bold))
                        .tracking(-0.5)
                        .foregroundStyle(Theme.onSurface)
                    if let description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }
                }
                Spacer(minLength: 0)
                if Actions.self != EmptyView.self {
                    actions
                }
            }

            if !stats.isEmpty {
                let columns = Array(
                    repeating: GridItem(.flexible(), spacing: Theme.spacingSm),
                    count: stats.count >= 4 ? 2 : min(stats.count, 2)
                )
                LazyVGrid(columns: columns, alignment: .leading, spacing: Theme.spacingSm) {
                    ForEach(stats) { stat in
                        CSStatTile(stat: stat)
                    }
                }
            }
        }
        .padding(Theme.spacingLg)
        .meshBackground()
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusLg)
                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusLg))
    }
}

extension CSHeroStrip where Actions == EmptyView {
    init(
        eyebrow: String? = nil,
        @ViewBuilder title: () -> Title,
        description: String? = nil,
        stats: [CSStat] = []
    ) {
        self.eyebrow = eyebrow
        self.title = title()
        self.description = description
        self.stats = stats
        self.actions = nil
    }
}

/// Single stat tile used inside `CSHeroStrip`.
struct CSStatTile: View {
    let stat: CSStat

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: stat.systemImage)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(stat.tone.iconColor)
                .frame(width: 32, height: 32)
                .background(Theme.surfaceContainerLow, in: RoundedRectangle(cornerRadius: 10))
            VStack(alignment: .leading, spacing: 1) {
                Text(stat.label)
                    .font(.system(size: 10, weight: .bold))
                    .tracking(0.6)
                    .textCase(.uppercase)
                    .foregroundStyle(Theme.outline)
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(stat.value)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(Theme.onSurface)
                    if let sub = stat.sub {
                        Text(sub)
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.outline)
                    }
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Theme.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .strokeBorder(Theme.outlineVariant.opacity(0.6), lineWidth: 1)
        )
    }
}
