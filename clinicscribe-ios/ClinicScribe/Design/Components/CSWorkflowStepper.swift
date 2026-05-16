import SwiftUI

/// `CSWorkflowStepper` — horizontal stepper for the consultation flow:
/// Prepare → Capture → Verify → Approve → Close. Mirrors the web
/// `<WorkflowStepper>` component.
enum CSWorkflowStep: String, CaseIterable, Identifiable {
    case prepare, capture, verify, approve, close

    var id: String { rawValue }

    var label: String {
        switch self {
        case .prepare: return "Prepare"
        case .capture: return "Capture"
        case .verify: return "Verify"
        case .approve: return "Approve"
        case .close: return "Close"
        }
    }

    var systemImage: String {
        switch self {
        case .prepare: return "doc.text.below.ecg"
        case .capture: return "mic.fill"
        case .verify: return "checkmark.shield"
        case .approve: return "doc.badge.checkmark"
        case .close: return "checkmark.circle"
        }
    }
}

struct CSWorkflowStepper: View {
    let active: CSWorkflowStep
    var completed: Set<CSWorkflowStep> = []
    var disabled: Set<CSWorkflowStep> = []
    var onSelect: ((CSWorkflowStep) -> Void)? = nil

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 4) {
                let steps = CSWorkflowStep.allCases
                let activeIndex = steps.firstIndex(of: active) ?? 0
                ForEach(Array(steps.enumerated()), id: \.element) { (i, step) in
                    let isActive = step == active
                    let isComplete = completed.contains(step) || (!isActive && i < activeIndex)
                    let isDisabled = disabled.contains(step)

                    HStack(spacing: 6) {
                        StepChip(
                            step: step,
                            index: i,
                            isActive: isActive,
                            isComplete: isComplete,
                            isDisabled: isDisabled,
                            onTap: onSelect
                        )
                        if i < steps.count - 1 {
                            Rectangle()
                                .fill(i < activeIndex ? Theme.secondary.opacity(0.4) : Theme.outlineVariant)
                                .frame(width: 18, height: 1)
                        }
                    }
                }
            }
            .padding(6)
        }
        .background(Theme.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
        .themeShadow(Theme.shadowAmbientSm)
    }
}

private struct StepChip: View {
    let step: CSWorkflowStep
    let index: Int
    let isActive: Bool
    let isComplete: Bool
    let isDisabled: Bool
    let onTap: ((CSWorkflowStep) -> Void)?

    var body: some View {
        Button {
            if !isDisabled { onTap?(step) }
        } label: {
            HStack(spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 7)
                        .fill(iconBackground)
                        .frame(width: 22, height: 22)
                    Image(systemName: step.systemImage)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(iconForeground)
                }
                Text(step.label)
                    .font(.system(size: 13, weight: .semibold))
                Text(String(format: "0%d", index + 1))
                    .font(.system(size: 10, weight: .semibold).monospaced())
                    .foregroundStyle(isActive ? Theme.onPrimary.opacity(0.6) : Theme.outline)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .foregroundStyle(foreground)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .opacity(isDisabled ? 0.5 : 1)
        }
        .buttonStyle(.plain)
        .disabled(isDisabled || onTap == nil)
    }

    private var background: Color {
        if isActive { return Theme.primary }
        if isComplete { return Theme.secondary.opacity(0.1) }
        return .clear
    }
    private var foreground: Color {
        if isActive { return Theme.onPrimary }
        if isComplete { return Theme.secondary }
        return Theme.onSurfaceVariant
    }
    private var iconBackground: Color {
        if isActive { return Theme.onPrimary.opacity(0.15) }
        if isComplete { return Theme.secondary }
        return Theme.surfaceContainer
    }
    private var iconForeground: Color {
        if isActive { return Theme.onPrimary }
        if isComplete { return .white }
        return Theme.onSurfaceVariant
    }
}
