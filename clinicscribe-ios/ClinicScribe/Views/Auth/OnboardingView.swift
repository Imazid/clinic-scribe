import SwiftUI

/// `OnboardingView` — pixel-faithful port of the design package's
/// `IOSOnboarding` paged carousel. Four stops:
///   0  presence — welcome (avatars + mic)
///   1  record   — how it works (big mic + waveform)
///   2  safety   — clinician sign-off (flagged-plan card)
///   3  go       — three quick questions (status cards)
///
/// Pure view — pushes onto `MainTabView` (via the dismiss closure) once the
/// final stop is acknowledged. Wire the launch from `ClinicScribeApp` for
/// first-run users, or push from a "Start tour" entry point.
struct OnboardingView: View {
    let onFinish: () -> Void

    @State private var stop: Int = 0
    @Environment(\.dismiss) private var dismiss

    private let stops: [OnboardingStop] = [
        .init(
            kind: .presence,
            eyebrow: "Welcome",
            title: "Be present in the",
            italic: "room.",
            body: "Miraa listens, drafts, and flags. You stay focused on the patient."
        ),
        .init(
            kind: .record,
            eyebrow: "How it works",
            title: "Tap once to start.",
            italic: "We do the rest.",
            body: "Record any consult. We turn it into a draft note before the patient leaves."
        ),
        .init(
            kind: .safety,
            eyebrow: "Always under your control",
            title: "You sign every",
            italic: "note.",
            body: "Critical safety flags block sign-off. Miraa drafts. You decide."
        ),
        .init(
            kind: .go,
            eyebrow: "Ready",
            title: "Three quick",
            italic: "questions.",
            body: "Tell us about your clinic and we'll be in."
        ),
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            Theme.surface.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 0) {
                // Top bar — back chevron + skip
                HStack {
                    Button {
                        if stop > 0 { withAnimation(.spring(response: 0.35)) { stop -= 1 } }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Theme.onSurface)
                            .frame(width: 36, height: 36)
                            .background(Circle().fill(Theme.surfaceContainerLowest))
                            .overlay(Circle().strokeBorder(Theme.outlineVariant, lineWidth: 1))
                    }
                    .accessibilityLabel("Back")
                    .opacity(stop == 0 ? 0 : 1)
                    .disabled(stop == 0)

                    Spacer()

                    Button("Skip") {
                        onFinish()
                    }
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)
                }
                .padding(.horizontal, 22)
                .padding(.top, 6)

                // Visual
                OnboardingVisual(kind: stops[stop].kind)
                    .frame(height: 320)
                    .padding(.horizontal, 22)
                    .padding(.top, 12)
                    .id(stops[stop].kind)
                    .transition(.opacity.combined(with: .scale(scale: 0.98)))

                // Copy
                VStack(alignment: .leading, spacing: 12) {
                    Text(stops[stop].eyebrow.uppercased())
                        .font(.system(size: 11, weight: .bold))
                        .tracking(1.1)
                        .foregroundStyle(Theme.outline)

                    VStack(alignment: .leading, spacing: 0) {
                        Text(stops[stop].title)
                            .font(.system(size: 30, weight: .semibold))
                            .foregroundStyle(Theme.onSurface)
                            .tracking(-0.5)
                        Text(stops[stop].italic).serifItalic()
                            .font(.system(size: 30, weight: .semibold))
                            .tracking(-0.5)
                    }

                    Text(stops[stop].body)
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .lineSpacing(2)
                }
                .padding(.horizontal, 26)
                .padding(.top, 24)

                Spacer()
            }
            .padding(.bottom, 160)

            // Bottom: dots + primary CTA
            VStack(spacing: 18) {
                HStack(spacing: 6) {
                    ForEach(0..<stops.count, id: \.self) { i in
                        Capsule()
                            .fill(i == stop ? Theme.secondary : Theme.outlineVariant)
                            .frame(width: i == stop ? 22 : 6, height: 6)
                            .animation(.easeOut(duration: 0.2), value: stop)
                    }
                }

                CSButton(
                    title: stop == stops.count - 1 ? "Get started" : "Continue",
                    variant: .primary,
                    size: .lg,
                    isFullWidth: true
                ) {
                    if stop == stops.count - 1 {
                        onFinish()
                    } else {
                        withAnimation(.spring(response: 0.35)) { stop += 1 }
                    }
                }
            }
            .padding(.horizontal, 26)
            .padding(.bottom, 30)
        }
    }
}

// MARK: - Step model

private struct OnboardingStop: Identifiable {
    let id = UUID()
    let kind: OnboardingVisualKind
    let eyebrow: String
    let title: String
    let italic: String
    let body: String
}

// MARK: - Visuals

private enum OnboardingVisualKind: String {
    case presence, record, safety, go
}

private struct OnboardingVisual: View {
    let kind: OnboardingVisualKind

    var body: some View {
        switch kind {
        case .presence: presenceVisual
        case .record: recordVisual
        case .safety: safetyVisual
        case .go: goVisual
        }
    }

    private var presenceVisual: some View {
        ZStack {
            LinearGradient(
                colors: [Theme.secondary, Color(hex: "#1F3F58")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Circle()
                .fill(Color(hex: "#E8DBC8").opacity(0.14))
                .frame(width: 220, height: 220)
                .offset(x: 100, y: -90)
            Circle()
                .fill(Color.white.opacity(0.06))
                .frame(width: 200, height: 200)
                .offset(x: -100, y: 90)

            HStack(spacing: 22) {
                VStack(spacing: 8) {
                    Circle()
                        .fill(Theme.surfaceContainerHigh)
                        .frame(width: 64, height: 64)
                        .overlay(
                            Text("AF")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.onSurface)
                        )
                    Text("Patient")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Color.white.opacity(0.75))
                }

                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.12))
                        .frame(width: 38, height: 38)
                    Image(systemName: "mic.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Color(hex: "#E8DBC8"))
                }

                VStack(spacing: 8) {
                    Circle()
                        .fill(Theme.primary)
                        .frame(width: 64, height: 64)
                        .overlay(
                            Text("IM")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.onPrimary)
                        )
                    Text("You")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Color.white.opacity(0.75))
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }

    private var recordVisual: some View {
        ZStack {
            Theme.surfaceContainerLowest
            RadialGradient(
                colors: [Theme.error.opacity(0.18), Color.clear],
                center: UnitPoint(x: 0.5, y: 0.4),
                startRadius: 6,
                endRadius: 220
            )

            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Theme.error)
                        .frame(width: 96, height: 96)
                        .shadow(color: Theme.error.opacity(0.35), radius: 16, y: 12)
                    Image(systemName: "mic.fill")
                        .font(.system(size: 36, weight: .semibold))
                        .foregroundStyle(Color.white)
                }

                Text("00:42")
                    .font(.system(size: 22, weight: .semibold).monospaced())
                    .foregroundStyle(Theme.onSurface)

                HStack(alignment: .center, spacing: 3) {
                    ForEach(0..<30, id: \.self) { i in
                        let h = 6 + abs(sin(Double(i) * 0.55) * 18)
                        Capsule()
                            .fill(i < 21 ? Theme.secondary : Theme.outlineVariant)
                            .frame(width: 3, height: h)
                    }
                }
                .frame(height: 28)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 22))
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
        )
    }

    private var safetyVisual: some View {
        ZStack {
            LinearGradient(
                colors: [Theme.surface, Theme.surfaceContainer],
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(spacing: 14) {
                // flagged plan card
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 8) {
                        Text("PLAN")
                            .font(.system(size: 10, weight: .bold))
                            .tracking(0.6)
                            .foregroundStyle(Theme.outline)
                        Text("FLAGGED")
                            .font(.system(size: 9, weight: .bold))
                            .tracking(0.5)
                            .foregroundStyle(Theme.error)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                Capsule().fill(Theme.error.opacity(0.10))
                            )
                    }
                    (
                        Text("Trial ")
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.onSurface)
                        +
                        Text("NSAID with warfarin")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Theme.error)
                        +
                        Text(" — possible interaction.")
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.onSurface)
                    )
                    .lineSpacing(2)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Theme.surfaceContainerLowest)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Theme.outlineVariant, lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.06), radius: 8, y: 4)

                HStack(spacing: 8) {
                    Text("Edit")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Theme.onSurface)
                        .frame(maxWidth: .infinity)
                        .frame(height: 38)
                        .background(Theme.surfaceContainerLowest)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
                        )

                    HStack(spacing: 6) {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 11, weight: .bold))
                        Text("Resolve flag to approve")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 38)
                    .frame(maxWidth: .infinity)
                    .background(Theme.secondary.opacity(0.5))
                    .foregroundStyle(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding(22)
        }
        .clipShape(RoundedRectangle(cornerRadius: 22))
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
        )
    }

    private var goVisual: some View {
        ZStack {
            LinearGradient(
                colors: [Theme.surfaceContainerHigh, Theme.surface],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 10) {
                ForEach(goRows, id: \.title) { row in
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 9)
                                .fill(Theme.secondary.opacity(0.10))
                                .frame(width: 32, height: 32)
                            Image(systemName: row.icon)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(Theme.secondary)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(row.title.uppercased())
                                .font(.system(size: 11, weight: .bold))
                                .tracking(0.6)
                                .foregroundStyle(Theme.outline)
                            Text(row.value)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(Theme.onSurface)
                        }
                        Spacer()
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(Theme.success)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Theme.surfaceContainerLowest)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .strokeBorder(Theme.outlineVariant, lineWidth: 1)
                    )
                }
            }
            .padding(22)
        }
        .clipShape(RoundedRectangle(cornerRadius: 22))
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
        )
    }

    private var goRows: [GoRow] {
        [
            GoRow(icon: "briefcase", title: "Practice type", value: "GP · Solo"),
            GoRow(icon: "cpu", title: "EMR", value: "Best Practice"),
            GoRow(icon: "shield", title: "AI safety", value: "Strict"),
        ]
    }

    private struct GoRow {
        let icon: String
        let title: String
        let value: String
    }
}

#Preview("Onboarding") {
    OnboardingView(onFinish: {})
}
