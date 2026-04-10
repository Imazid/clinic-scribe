import SwiftUI

struct NoteReviewView: View {
    let consultation: Consultation
    @StateObject private var vm = NoteReviewViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var isPresentingTemplatePicker = false
    @State private var templates: [NoteTemplate] = NoteTemplateCatalog.allTemplates

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                if vm.isGenerating {
                    VStack(spacing: Theme.spacingMd) {
                        ProgressView()
                        Text("Generating clinical note...")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(40)
                } else if vm.note == nil, let error = vm.errorMessage {
                    VStack(spacing: Theme.spacingMd) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundStyle(Theme.error)
                            .accessibilityLabel("Error")
                        Text("Failed to generate note")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)
                        Text(error)
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task { await vm.load(consultation: consultation) }
                        }
                        .buttonStyle(.bordered)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(40)
                } else if vm.note == nil, let transcript = vm.transcript {
                    templateControls(transcript: transcript)

                    TranscriptViewer(transcript: transcript)

                    if let error = vm.errorMessage {
                        Text(error).font(.caption).foregroundStyle(Theme.error)
                    }
                } else if vm.note == nil && vm.transcript == nil {
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
                } else {
                    templateControls(transcript: vm.transcript)

                    if let transcript = vm.transcript {
                        TranscriptViewer(transcript: transcript)
                    }

                    // Confidence
                    if let note = vm.note {
                        ConfidenceIndicator(scores: note.confidenceScores)
                    }

                    if let status = vm.verificationStatus {
                        VerificationStatusCard(status: status)
                    }

                    if !vm.provenance.isEmpty {
                        ProvenanceCard(items: vm.provenance)
                    }

                    if !vm.qaFindings.isEmpty {
                        QAFindingCard(findings: vm.qaFindings)
                    }

                    // SOAP Sections
                    SOAPSectionEditor(title: "Subjective", text: $vm.subjective)
                    SOAPSectionEditor(title: "Objective", text: $vm.objective)
                    SOAPSectionEditor(title: "Assessment", text: $vm.assessment)
                    SOAPSectionEditor(title: "Plan", text: $vm.plan)

                    // Medications
                    MedicationDraftView(medications: $vm.medications)

                    // Follow-up Tasks
                    FollowUpTasksView(tasks: $vm.followUpTasks)

                    // Referrals
                    if !vm.referrals.isEmpty {
                        VStack(alignment: .leading, spacing: Theme.spacingSm) {
                            Text("Referrals").font(.headline).foregroundStyle(Theme.onSurface)
                            ForEach(vm.referrals, id: \.self) { r in
                                Text("- \(r)").font(.body).foregroundStyle(Theme.onSurface)
                            }
                        }
                        .cardStyle()
                    }

                    if let summary = vm.patientSummarySnapshot {
                        PatientCommunicationCard(summary: summary)
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
