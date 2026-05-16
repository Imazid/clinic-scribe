import SwiftUI

struct ConsultationVerifyLoaderView: View {
    let consultationId: UUID
    @StateObject private var vm = ConsultationDetailViewModel()

    var body: some View {
        Group {
            if let consultation = vm.consultation {
                NoteReviewView(consultation: consultation)
            } else if vm.isLoading {
                ProgressView("Loading note review...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                VStack(spacing: Theme.spacingMd) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundStyle(Theme.error)
                    Text(vm.errorMessage ?? "Unable to load this consultation.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .multilineTextAlignment(.center)
                    CSButton(title: "Retry", variant: .outline, size: .sm, isFullWidth: false) {
                        Task { await vm.load(id: consultationId) }
                    }
                }
                .padding(Theme.spacingLg)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(Theme.surface)
        .navigationTitle("Verify")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load(id: consultationId) }
    }
}

struct ConsultationSessionWorkspaceView: View {
    let consultationId: UUID

    @StateObject private var vm = ConsultationDetailViewModel()
    @StateObject private var audioService = AudioService()
    @State private var selectedTemplate = NoteTemplateCatalog.defaultTemplate
    @State private var isResolvingTemplate = true
    @State private var templateErrorMessage: String?

    var body: some View {
        ScrollView {
            if let consultation = vm.consultation {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    sessionHero(consultation: consultation)

                    CSWorkflowStepper(
                        active: workflowStep(for: consultation.status),
                        completed: completedSteps(for: consultation.status)
                    )

                    templateCard(for: consultation)

                    if consultation.transcript == nil && consultation.status == .recording {
                        AudioRecorderView(
                            consultation: consultation,
                            audioService: audioService,
                            selectedTemplate: selectedTemplate
                        ) {
                            Task {
                                await vm.load(id: consultation.id)
                                await resolveTemplate()
                            }
                        }
                    } else {
                        sessionStatusCard(consultation: consultation)
                    }

                    if let transcript = consultation.transcript {
                        TranscriptViewer(transcript: transcript)
                    }

                    if let errorMessage = vm.errorMessage {
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundStyle(Theme.error)
                    }
                }
                .padding(Theme.spacingMd)
            } else if vm.isLoading {
                ProgressView("Loading session...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, 120)
            } else {
                VStack(spacing: Theme.spacingMd) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundStyle(Theme.error)
                    Text(vm.errorMessage ?? "Unable to load this session.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .multilineTextAlignment(.center)
                    CSButton(title: "Retry", variant: .outline, size: .sm, isFullWidth: false) {
                        Task {
                            await vm.load(id: consultationId)
                            await resolveTemplate()
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 120)
            }
        }
        .background(Theme.surface)
        .navigationTitle("Capture Session")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable {
            await vm.load(id: consultationId)
            await resolveTemplate()
        }
        .task {
            await vm.load(id: consultationId)
            await resolveTemplate()
        }
    }

    private func sessionHero(consultation: Consultation) -> some View {
        let stats: [CSStat] = [
            CSStat(label: "Patient", value: consultation.patient?.fullName ?? "Unknown",
                   sub: consultation.consultationType,
                   systemImage: "person.crop.circle"),
            CSStat(label: "Status", value: consultation.status.label,
                   sub: DateFormatters.formatISO(consultation.startedAt),
                   systemImage: "clock",
                   tone: tone(for: consultation.status)),
            CSStat(label: "Recording", value: consultation.audioRecording == nil ? "Pending" : "Saved",
                   sub: consultation.audioRecording == nil ? "Awaiting capture" : "On file",
                   systemImage: "waveform",
                   tone: consultation.audioRecording == nil ? .default : .success),
            CSStat(label: "Transcript", value: consultation.transcript == nil ? "Pending" : "Ready",
                   sub: consultation.transcript == nil ? "Awaiting" : "Verified copy",
                   systemImage: "text.alignleft",
                   tone: consultation.transcript == nil ? .default : .success),
        ]
        return VStack(alignment: .leading, spacing: Theme.spacingSm) {
            CSHeroStrip(
                eyebrow: "CAPTURE SESSION",
                title: {
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text("Stay present.")
                        CSHeroAccent("We'll listen.")
                    }
                },
                description: "Miraa captures the consult, drafts the note, and surfaces flags. You stay focused on the patient.",
                stats: stats
            )

            if isResolvingTemplate {
                HStack(spacing: 6) {
                    ProgressView().scaleEffect(0.7)
                    Text("Loading template…")
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
                .padding(.horizontal, Theme.spacingSm)
            } else if let templateErrorMessage {
                Text(templateErrorMessage)
                    .font(.caption)
                    .foregroundStyle(Theme.error)
                    .padding(.horizontal, Theme.spacingSm)
            }
        }
    }

    private func tone(for status: ConsultationStatus) -> CSStat.Tone {
        switch status {
        case .recording: return .error
        case .transcribing, .generating: return .warning
        case .reviewPending: return .warning
        case .approved, .closeoutPending, .closed, .exported: return .success
        case .scheduled, .briefReady: return .default
        }
    }

    private func workflowStep(for status: ConsultationStatus) -> CSWorkflowStep {
        switch status {
        case .scheduled, .briefReady: return .prepare
        case .recording, .transcribing, .generating: return .capture
        case .reviewPending: return .verify
        case .approved: return .approve
        case .closeoutPending, .closed, .exported: return .close
        }
    }

    private func completedSteps(for status: ConsultationStatus) -> Set<CSWorkflowStep> {
        switch status {
        case .scheduled, .briefReady: return []
        case .recording, .transcribing, .generating: return [.prepare]
        case .reviewPending: return [.prepare, .capture]
        case .approved: return [.prepare, .capture, .verify]
        case .closeoutPending, .closed, .exported: return [.prepare, .capture, .verify, .approve]
        }
    }

    private func sessionStatusCard(consultation: Consultation) -> some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                Text("Session Status")
                    .font(.headline)
                    .foregroundStyle(Theme.onSurface)

                Text(statusCopy(for: consultation))
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)

                if consultation.status == .reviewPending || consultation.clinicalNote != nil {
                    NavigationLink {
                        ConsultationVerifyLoaderView(consultationId: consultation.id)
                    } label: {
                        Text("Continue to Verify")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.onPrimary)
                            .padding(.horizontal, Theme.spacingMd)
                            .padding(.vertical, Theme.spacingSm)
                            .background(Theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    }
                }
            }
        }
    }

    private func templateCard(for consultation: Consultation) -> some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                Text("Template")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.onSurfaceVariant)

                Text(selectedTemplate.name)
                    .font(.headline)
                    .foregroundStyle(Theme.onSurface)

                Text("This session will keep using the saved template when the note is generated and reviewed.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)

                HStack(spacing: Theme.spacingSm) {
                    CSBadge(text: selectedTemplate.kind.rawValue.replacingOccurrences(of: "_", with: " ").capitalized, variant: .info)
                    CSBadge(text: selectedTemplate.preferredFormat.rawValue.replacingOccurrences(of: "_", with: " ").capitalized)
                }

                if consultation.transcript != nil || consultation.clinicalNote != nil || consultation.status == .reviewPending {
                    NavigationLink {
                        ConsultationVerifyLoaderView(consultationId: consultation.id)
                    } label: {
                        Text("Open Verify")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.onPrimary)
                            .padding(.horizontal, Theme.spacingMd)
                            .padding(.vertical, Theme.spacingSm)
                            .background(Theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    }
                } else {
                    Text("Verify unlocks once a transcript is ready.")
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
    }

    private func statusCopy(for consultation: Consultation) -> String {
        switch consultation.status {
        case .recording:
            return consultation.transcript == nil
                ? "Capture is still open for this session. Record directly here, then move into verification once transcription finishes."
                : "Recording is complete. Review the transcript below or move into Verify when you're ready."
        case .transcribing:
            return "Audio has been uploaded and transcription is still running."
        case .generating:
            return "The note is being generated from the saved transcript and template."
        case .reviewPending:
            return "The note draft is ready for clinical verification."
        case .approved, .closeoutPending, .closed, .exported:
            return "This session has moved beyond capture. Open Verify to inspect the clinical note or continue closeout."
        case .scheduled, .briefReady:
            return "This session is queued but capture has not started yet."
        }
    }

    private func resolveTemplate() async {
        isResolvingTemplate = true
        templateErrorMessage = nil

        guard let consultation = vm.consultation else {
            isResolvingTemplate = false
            return
        }

        let resolved = await TemplateLibraryService.shared.resolveTemplate(
            key: consultation.templateKey ?? consultation.clinicalNote?.templateKey,
            clinicId: consultation.clinicId
        )

        if let resolved {
            selectedTemplate = resolved
        } else {
            selectedTemplate = NoteTemplateCatalog.suggestedTemplate(
                for: consultation.consultationType,
                transcript: consultation.transcript?.fullText
            )
            if consultation.templateKey != nil {
                templateErrorMessage = "The saved template could not be resolved on this device, so Miraa is using the closest available default."
            }
        }

        isResolvingTemplate = false
    }
}
