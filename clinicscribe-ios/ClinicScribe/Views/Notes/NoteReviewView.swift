import SwiftUI

/// `NoteReviewView` — pixel-faithful to the design package's `IOSReview`.
/// Editorial hero ("Nothing leaves the system without *you.*"), workflow
/// stepper anchored at `verify`, then a four-tab cluster: Note / Transcript /
/// Summary / Provenance. All existing data wiring (template picker, SOAP
/// editors, medications, follow-ups, referrals, QA findings, approval bar)
/// preserved verbatim — visual only.
struct NoteReviewView: View {
    let consultation: Consultation
    @StateObject private var vm = NoteReviewViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var isPresentingTemplatePicker = false
    @State private var templates: [NoteTemplate] = NoteTemplateCatalog.allTemplates
    @State private var activeTab: ReviewTab = .note

    private enum ReviewTab: String, CaseIterable, Identifiable {
        case note, transcript, summary, provenance
        var id: String { rawValue }
        var label: String {
            switch self {
            case .note: return "Note"
            case .transcript: return "Transcript"
            case .summary: return "Summary"
            case .provenance: return "Provenance"
            }
        }
        var systemImage: String {
            switch self {
            case .note: return "doc.text"
            case .transcript: return "text.alignleft"
            case .summary: return "envelope"
            case .provenance: return "checkmark.shield"
            }
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                hero

                CSWorkflowStepper(active: .verify, completed: [.prepare, .capture])

                if vm.isGenerating {
                    generatingPanel
                } else if vm.note == nil, let error = vm.errorMessage {
                    errorPanel(error: error)
                } else if vm.note == nil, let transcript = vm.transcript {
                    templateControls(transcript: transcript)
                    TranscriptViewer(transcript: transcript)
                    if let error = vm.errorMessage {
                        Text(error).font(.caption).foregroundStyle(Theme.error)
                    }
                } else if vm.note == nil && vm.transcript == nil {
                    waitingPanel
                } else {
                    templateControls(transcript: vm.transcript)

                    if let note = vm.note {
                        ConfidenceIndicator(scores: note.confidenceScores)
                    }
                    if let status = vm.verificationStatus {
                        VerificationStatusCard(status: status)
                    }

                    tabSwitcher

                    Group {
                        switch activeTab {
                        case .note: noteTab
                        case .transcript: transcriptTab
                        case .summary: summaryTab
                        case .provenance: provenanceTab
                        }
                    }

                    if let error = vm.errorMessage {
                        Text(error).font(.caption).foregroundStyle(Theme.error)
                    }
                }
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("Verify Note")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            if vm.note != nil {
                NoteApprovalBar(
                    confidence: vm.note?.confidenceScores.overall ?? 0,
                    isApproving: vm.isApproving,
                    onApprove: {
                        Task {
                            guard let profileId = consultation.clinicianId as UUID? else { return }
                            let success = await vm.approve(consultationId: consultation.id, approvedBy: profileId)
                            if success { dismiss() }
                        }
                    },
                    onCopy: {
                        if let note = vm.note {
                            ExportService.shared.copyNoteToClipboard(note: note, patientName: consultation.patient?.fullName ?? "")
                        }
                    }
                )
            } else if vm.transcript != nil {
                CSCard {
                    CSButton(
                        title: "Generate \(vm.selectedTemplate.name)",
                        isLoading: vm.isGenerating
                    ) {
                        Task {
                            guard let transcript = vm.transcript else { return }
                            _ = await vm.generate(consultationId: consultation.id, transcript: transcript.fullText)
                        }
                    }
                }
                .padding(.horizontal, Theme.spacingMd)
                .padding(.bottom, Theme.spacingSm)
            }
        }
        .task { await vm.load(consultation: consultation) }
        .task {
            templates = (try? await TemplateLibraryService.shared.loadTemplates(clinicId: consultation.clinicId)) ?? NoteTemplateCatalog.allTemplates
        }
        .sheet(isPresented: $isPresentingTemplatePicker) {
            NoteTemplatePickerView(title: "Choose Template", templates: templates, selectedTemplate: $vm.selectedTemplate)
                .presentationDetents([.large])
        }
    }

    // MARK: - Hero

    private var hero: some View {
        let confidence = vm.note?.confidenceScores.overall ?? 0
        let confidenceValue = vm.note == nil ? "—" : "\(Int(round(confidence * 100)))%"
        let flagCount = vm.qaFindings.count
        let stats: [CSStat] = [
            CSStat(label: "Patient", value: consultation.patient?.fullName ?? "Unknown",
                   sub: consultation.consultationType,
                   systemImage: "person.crop.circle"),
            CSStat(label: "Confidence", value: confidenceValue,
                   sub: vm.note == nil ? "Awaiting note" : confidenceLabel(confidence),
                   systemImage: "gauge.high",
                   tone: confidenceTone(confidence)),
            CSStat(label: "Flags", value: "\(flagCount)",
                   sub: flagCount == 0 ? "Clear" : "Resolve to approve",
                   systemImage: "exclamationmark.shield",
                   tone: flagCount == 0 ? .success : .warning),
            CSStat(label: "Template", value: vm.selectedTemplate.name,
                   sub: vm.selectedTemplate.preferredFormat.rawValue
                        .replacingOccurrences(of: "_", with: " ")
                        .capitalized,
                   systemImage: "doc.text.below.ecg"),
        ]
        return CSHeroStrip(
            eyebrow: "VERIFY",
            title: {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("Nothing leaves the system without")
                    CSHeroAccent("you.")
                }
            },
            description: "Edit the draft, resolve flags, sign it off. Miraa drafts — you decide.",
            stats: stats
        )
    }

    private func confidenceLabel(_ score: Double) -> String {
        switch score {
        case 0.85...: return "High"
        case 0.7..<0.85: return "Solid"
        case 0.5..<0.7: return "Review carefully"
        default: return "Low — verify each section"
        }
    }

    private func confidenceTone(_ score: Double) -> CSStat.Tone {
        if vm.note == nil { return .default }
        switch score {
        case 0.85...: return .success
        case 0.7..<0.85: return .info
        case 0.5..<0.7: return .warning
        default: return .error
        }
    }

    // MARK: - Tab switcher

    private var tabSwitcher: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(ReviewTab.allCases) { tab in
                    Button {
                        withAnimation(.spring(response: 0.3)) { activeTab = tab }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: tab.systemImage)
                                .font(.system(size: 11, weight: .bold))
                            Text(tab.label)
                                .font(.system(size: 13, weight: .semibold))
                            if tab == .provenance && !vm.qaFindings.isEmpty {
                                Text("\(vm.qaFindings.count)")
                                    .font(.system(size: 10, weight: .bold))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 1)
                                    .background(Capsule().fill(Theme.error))
                                    .foregroundStyle(Color.white)
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .foregroundStyle(activeTab == tab ? Theme.onPrimary : Theme.onSurfaceVariant)
                        .background(activeTab == tab ? Theme.primary : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 11))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(4)
        }
        .background(Theme.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
    }

    // MARK: - Tab content

    private var noteTab: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            SOAPSectionEditor(title: "Subjective", text: $vm.subjective)
            SOAPSectionEditor(title: "Objective", text: $vm.objective)
            SOAPSectionEditor(title: "Assessment", text: $vm.assessment)
            SOAPSectionEditor(title: "Plan", text: $vm.plan)

            MedicationDraftView(medications: $vm.medications)
            FollowUpTasksView(tasks: $vm.followUpTasks)

            if !vm.referrals.isEmpty {
                CSCard {
                    VStack(alignment: .leading, spacing: Theme.spacingSm) {
                        Text("Referrals")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)
                        ForEach(vm.referrals, id: \.self) { r in
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "arrow.up.right.circle.fill")
                                    .font(.system(size: 13))
                                    .foregroundStyle(Theme.secondary)
                                    .padding(.top, 2)
                                Text(r)
                                    .font(.body)
                                    .foregroundStyle(Theme.onSurface)
                            }
                        }
                    }
                }
            }
        }
    }

    private var transcriptTab: some View {
        Group {
            if let transcript = vm.transcript {
                TranscriptViewer(transcript: transcript)
            } else {
                CSCard {
                    Text("No transcript available for this session.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
    }

    private var summaryTab: some View {
        Group {
            if let summary = vm.patientSummarySnapshot {
                PatientCommunicationCard(summary: summary)
            } else {
                CSCard {
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        Text("Patient summary not generated yet")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.onSurface)
                        Text("After approval, Miraa can produce a plain-language summary, instructions, and a family-ready email from this draft.")
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }
                }
            }
        }
    }

    private var provenanceTab: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            if !vm.qaFindings.isEmpty {
                QAFindingCard(findings: vm.qaFindings)
            }
            if !vm.provenance.isEmpty {
                ProvenanceCard(items: vm.provenance)
            }
            if vm.qaFindings.isEmpty && vm.provenance.isEmpty {
                CSCard {
                    HStack(spacing: 10) {
                        Image(systemName: "checkmark.shield.fill")
                            .font(.system(size: 18))
                            .foregroundStyle(Theme.success)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("No flags raised")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.onSurface)
                            Text("Provenance entries will appear once the model traces SOAP sentences back to transcript turns.")
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }

    // MARK: - State panels

    private var generatingPanel: some View {
        CSCard {
            VStack(spacing: Theme.spacingMd) {
                ProgressView()
                Text("Drafting clinical note…")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.onSurface)
                Text("Miraa is structuring the transcript using \(vm.selectedTemplate.name). This usually takes under a minute.")
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.spacingMd)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.spacingMd)
        }
    }

    private func errorPanel(error: String) -> some View {
        CSCard {
            VStack(spacing: Theme.spacingSm) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.title2)
                    .foregroundStyle(Theme.error)
                    .accessibilityLabel("Error")
                Text("Failed to generate note")
                    .font(.headline)
                    .foregroundStyle(Theme.onSurface)
                Text(error)
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.spacingMd)
                CSButton(title: "Retry", variant: .outline, size: .sm, isFullWidth: false) {
                    Task { await vm.load(consultation: consultation) }
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.spacingMd)
        }
    }

    private var waitingPanel: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                Text("Verify will unlock once the transcript is ready")
                    .font(.headline)
                    .foregroundStyle(Theme.onSurface)
                Text("This session is still moving through capture or transcription. Come back once the transcript has been created.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)
            }
        }
    }

    @ViewBuilder
    private func templateControls(transcript: Transcript?) -> some View {
        NoteTemplateSelectionCard(
            title: "Template",
            template: vm.selectedTemplate,
            helperText: transcript == nil
                ? "Choose the structure before generating a note."
                : "Change the structure if this consult needs a different style.",
            actionTitle: "Browse templates"
        ) {
            isPresentingTemplatePicker = true
        }
    }
}

private struct PatientCommunicationCard: View {
    let summary: PatientSummarySnapshot

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                VStack(alignment: .leading, spacing: Theme.spacingXS) {
                    Text("Patient-Friendly Summary")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.onSurfaceVariant)

                    Text(summary.heading)
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)

                    Text(summary.plainLanguageSummary)
                        .font(.body)
                        .foregroundStyle(Theme.onSurface)
                }

                summarySection("Key Points", items: summary.keyPoints)
                summarySection("Medication Changes", items: summary.medicationChanges)
                summarySection("Next Steps", items: summary.nextSteps)
                summarySection("When To Seek Help", items: summary.seekHelp)

                HStack(alignment: .top, spacing: Theme.spacingSm) {
                    Image(systemName: "envelope.fill")
                        .foregroundStyle(Theme.secondary)
                    Text("After approval, this consult can generate patient instructions and a family-ready email draft from the same summary.")
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
    }

    @ViewBuilder
    private func summarySection(_ title: String, items: [String]) -> some View {
        if !items.isEmpty {
            VStack(alignment: .leading, spacing: Theme.spacingXS) {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.secondary)

                ForEach(items, id: \.self) { item in
                    HStack(alignment: .top, spacing: Theme.spacingSm) {
                        Circle()
                            .fill(Theme.secondary)
                            .frame(width: 6, height: 6)
                            .padding(.top, 7)
                        Text(item)
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurface)
                    }
                }
            }
        }
    }
}

private struct VerificationStatusCard: View {
    let status: NoteVerificationStatus

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                Text("Verification Status")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)
                CSBadge(text: status.rawValue.replacingOccurrences(of: "_", with: " ").capitalized, variant: badgeVariant)
            }
        }
    }

    private var badgeVariant: CSBadgeVariant {
        switch status {
        case .pending: return .default
        case .ready: return .info
        case .qaFlagged: return .warning
        case .approved: return .success
        }
    }
}

private struct ProvenanceCard: View {
    let items: [NoteProvenanceItem]

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                Text("Provenance")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)

                ForEach(items, id: \.id) { item in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(item.section.capitalized)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.secondary)
                            Spacer()
                            Text(item.source.rawValue.replacingOccurrences(of: "_", with: " "))
                                .font(.caption2)
                                .foregroundStyle(Theme.outline)
                        }
                        Text(item.sentence)
                            .font(.body)
                            .foregroundStyle(Theme.onSurface)
                        if !item.rationale.isEmpty {
                            Text(item.rationale)
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }
                    }
                    if item.id != items.last?.id {
                        Divider()
                    }
                }
            }
        }
    }
}

private struct QAFindingCard: View {
    let findings: [NoteQAFinding]

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                Text("QA Findings")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)

                ForEach(findings, id: \.id) { finding in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(finding.severity.capitalized)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(severityColor(for: finding.severity))
                            Spacer()
                            if let section = finding.section {
                                Text(section.capitalized)
                                    .font(.caption2)
                                    .foregroundStyle(Theme.outline)
                            }
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(finding.title)
                                .font(.body.weight(.semibold))
                                .foregroundStyle(Theme.onSurface)
                            Text(finding.detail)
                                .font(.body)
                                .foregroundStyle(Theme.onSurface)
                        }
                    }
                    if finding.id != findings.last?.id {
                        Divider()
                    }
                }
            }
        }
    }

    private func severityColor(for severity: String) -> Color {
        switch severity.lowercased() {
        case "critical": return Theme.error
        case "warning": return Theme.warning
        default: return Theme.secondary
        }
    }
}
