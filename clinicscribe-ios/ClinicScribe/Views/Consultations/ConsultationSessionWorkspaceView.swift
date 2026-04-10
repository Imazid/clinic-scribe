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
                    sessionHeader(consultation: consultation)

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

    private func sessionHeader(consultation: Consultation) -> some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                HStack(alignment: .top, spacing: Theme.spacingMd) {
                    CSAvatar(initials: consultation.patient?.initials ?? "?", size: 48)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(consultation.patient?.fullName ?? "Unknown Patient")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(Theme.primary)
                        Text(consultation.consultationType)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Theme.onSurface)
                        Text(DateFormatters.formatISO(consultation.startedAt))
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }

                    Spacer()

                    CSBadge(text: consultation.status.label, variant: consultation.status.badgeVariant)
                }

                HStack(spacing: Theme.spacingSm) {
                    metricChip(label: "Recording", value: consultation.audioRecording == nil ? "Pending" : "Saved")
                    metricChip(label: "Transcript", value: consultation.transcript == nil ? "Pending" : "Ready")
                }

                if isResolvingTemplate {
                    ProgressView("Loading template...")
                        .font(.caption)
                } else if let templateErrorMessage {
                    Text(templateErrorMessage)
                        .font(.caption)
                        .foregroundStyle(Theme.error)
                }
            }
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

    private func metricChip(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption)
                .foregroundStyle(Theme.onSurfaceVariant)
            Text(value)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.onSurface)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.spacingSm)
        .background(Theme.surfaceContainerLow)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
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
