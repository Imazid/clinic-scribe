import SwiftUI

struct ConsultationDetailView: View {
    let consultationId: UUID
    @StateObject private var vm = ConsultationDetailViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var showDeleteConfirmation = false

    var body: some View {
        ScrollView {
            if let consultation = vm.consultation {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    ConsultationHeroCard(consultation: consultation, isDeleting: vm.isDeleting)

                    StatusTimeline(currentStatus: consultation.status)
                        .cardStyle()

                    if let error = vm.errorMessage {
                        ErrorBanner(message: error) {
                            Task { await vm.load(id: consultationId) }
                        }
                    }

                    ConsultationWorkspaceSummaryCard(consultation: consultation)

                    ConsultationTranscriptCard(consultation: consultation)

                    if let brief = consultation.visitBrief {
                        ConsultationBriefCard(brief: brief)
                    }

                    if let recording = consultation.audioRecording {
                        ConsultationRecordingCard(recording: recording)
                    }

                    ConsultationDangerZoneCard(isDeleting: vm.isDeleting) {
                        showDeleteConfirmation = true
                    }
                }
                .padding(Theme.spacingMd)
            } else if vm.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, 100)
            } else if let error = vm.errorMessage {
                VStack(spacing: Theme.spacingMd) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundStyle(Theme.error)
                        .accessibilityLabel("Error")
                    Text(error)
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .multilineTextAlignment(.center)
                    CSButton(title: "Retry", variant: .outline, size: .sm, isFullWidth: false) {
                        Task { await vm.load(id: consultationId) }
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 100)
            }
        }
        .background(Theme.surface)
        .navigationTitle("Consultation")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if vm.consultation != nil {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Image(systemName: "trash")
                    }
                    .disabled(vm.isDeleting)
                    .accessibilityLabel("Delete consultation")
                }
            }
        }
        .alert("Delete Consultation", isPresented: $showDeleteConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                Task {
                    let deleted = await vm.deleteConsultation(id: consultationId)
                    if deleted { dismiss() }
                }
            }
        } message: {
            Text("This will remove the consultation and its linked transcript, notes, and workflow artifacts.")
        }
        .refreshable { await vm.load(id: consultationId) }
        .task { await vm.load(id: consultationId) }
    }
}

private struct ConsultationHeroCard: View {
    let consultation: Consultation
    let isDeleting: Bool

    private var canOpenVerify: Bool {
        consultation.status == .reviewPending ||
        consultation.status == .generating ||
        consultation.status == .approved ||
        consultation.status == .closeoutPending ||
        consultation.clinicalNote != nil
    }

    private var transcriptStateText: String {
        if consultation.transcript != nil { return "Transcript ready" }
        if consultation.status == .transcribing { return "Transcribing" }
        return "Transcript pending"
    }

    private var transcriptStateVariant: CSBadgeVariant {
        if consultation.transcript != nil { return .success }
        if consultation.status == .transcribing { return .warning }
        return .default
    }

    var body: some View {
        CSCard(padding: 0) {
            VStack(alignment: .leading, spacing: 0) {
                VStack(alignment: .leading, spacing: Theme.spacingMd) {
                    HStack(alignment: .top, spacing: Theme.spacingMd) {
                        CSAvatar(initials: consultation.patient?.initials ?? "?", size: 52)

                        VStack(alignment: .leading, spacing: Theme.spacingXS) {
                            Text(consultation.patient?.fullName ?? "Unknown Patient")
                                .font(.title3.weight(.bold))
                                .foregroundStyle(Theme.primary)

                            Text(consultation.consultationType)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(Theme.onSurface)

                            Text("Opened \(DateFormatters.formatISO(consultation.startedAt))")
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }

                        Spacer()
                    }

                    HStack(spacing: Theme.spacingXS) {
                        CSBadge(text: consultation.status.label, variant: consultation.status.badgeVariant)
                        CSBadge(text: transcriptStateText, variant: transcriptStateVariant)
                    }

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.spacingSm) {
                        WorkspaceMetricCard(
                            label: "Duration",
                            value: consultation.durationSeconds.map { DateFormatters.formatDuration(seconds: $0) } ?? "Pending",
                            icon: "clock"
                        )
                        WorkspaceMetricCard(
                            label: "Tasks",
                            value: "\(consultation.careTasks?.count ?? 0)",
                            icon: "list.bullet.clipboard"
                        )
                        WorkspaceMetricCard(
                            label: "Documents",
                            value: "\(consultation.generatedDocuments?.count ?? 0)",
                            icon: "doc.text"
                        )
                        WorkspaceMetricCard(
                            label: "Recording",
                            value: consultation.audioRecording == nil ? "No file" : "Available",
                            icon: "waveform"
                        )
                    }
                }
                .padding(Theme.spacingLg)

                Divider()

                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                    Text("Use this view to scan the transcript, confirm the visit context, and move into verification once the note is ready.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)

                    HStack(spacing: Theme.spacingSm) {
                        if canOpenVerify {
                            NavigationLink {
                                NoteReviewView(consultation: consultation)
                            } label: {
                                CSButton(
                                    title: consultation.clinicalNote == nil ? "Open Verify" : "Continue Verify",
                                    size: .sm,
                                    isFullWidth: true
                                ) {}
                                .allowsHitTesting(false)
                            }
                        }

                        if consultation.patient != nil {
                            NavigationLink {
                                PatientDetailView(patientId: consultation.patientId)
                            } label: {
                                CSButton(
                                    title: "Patient Record",
                                    variant: .outline,
                                    size: .sm,
                                    isFullWidth: true
                                ) {}
                                .allowsHitTesting(false)
                            }
                        }
                    }
                }
                .padding(Theme.spacingLg)
                .background(Theme.surfaceContainerLow)
            }
        }
        .overlay(alignment: .topTrailing) {
            if isDeleting {
                ProgressView()
                    .padding(Theme.spacingMd)
            }
        }
    }
}

private struct WorkspaceMetricCard: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(Theme.secondary)
                .frame(width: 34, height: 34)
                .background(Theme.secondaryFixed.opacity(0.22))
                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
                Text(value)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.onSurface)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
            }

            Spacer(minLength: 0)
        }
        .padding(Theme.spacingSm + Theme.spacingXS)
        .background(Theme.surfaceContainerLow)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
    }
}

private struct ConsultationWorkspaceSummaryCard: View {
    let consultation: Consultation

    private var openTasks: [CareTask] {
        (consultation.careTasks ?? []).filter { $0.status != .completed && $0.status != .cancelled }
    }

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                HStack {
                    Text("Workspace Summary")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)
                    Spacer()
                    if consultation.visitBrief != nil {
                        CSBadge(text: "Brief ready", variant: .info)
                    }
                }

                if let summary = consultation.patientSummary?.plainLanguageSummary, !summary.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        Text("Patient Summary")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.secondary)
                        Text(summary)
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .lineLimit(3)
                    }
                }

                if !openTasks.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        Text("Open Follow-up")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.secondary)

                        ForEach(openTasks.prefix(3)) { task in
                            HStack(alignment: .top, spacing: Theme.spacingSm) {
                                Circle()
                                    .fill(Theme.secondary)
                                    .frame(width: 7, height: 7)
                                    .padding(.top, 6)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(task.title)
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(Theme.onSurface)
                                    Text(task.description)
                                        .font(.caption)
                                        .foregroundStyle(Theme.onSurfaceVariant)
                                        .lineLimit(2)
                                }
                            }
                        }
                    }
                } else {
                    Text("No active closeout tasks have been generated for this consultation yet.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
    }
}

private struct ConsultationTranscriptCard: View {
    let consultation: Consultation

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                HStack {
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        Text("Transcript Workspace")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)
                        Text("Scan the discussion, confirm timestamps, and check whether the consult is ready for review.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }

                    Spacer()
                }

                if let transcript = consultation.transcript {
                    TranscriptViewer(transcript: transcript, embedded: true)
                } else {
                    VStack(spacing: Theme.spacingSm) {
                        Image(systemName: consultation.status == .transcribing ? "waveform.badge.magnifyingglass" : "text.bubble")
                            .font(.title2)
                            .foregroundStyle(Theme.secondary)
                        Text(consultation.status == .transcribing ? "Transcription is still running" : "No transcript available yet")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)
                        Text(
                            consultation.status == .transcribing
                            ? "The captured audio is still being processed for this consultation."
                            : "Start or upload a recording to populate the consultation workspace."
                        )
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.spacingXL)
                    .background(Theme.surfaceContainerLow)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                }
            }
        }
    }
}

private struct ConsultationBriefCard: View {
    let brief: VisitBrief

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                HStack {
                    Text("Visit Brief")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)
                    Spacer()
                    CSBadge(text: brief.status.capitalized, variant: .info)
                }

                Text(brief.summary)
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)

                if !brief.likelyAgenda.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        Text("Likely Agenda")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.secondary)
                        ForEach(brief.likelyAgenda.prefix(3), id: \.self) { item in
                            HStack(alignment: .top, spacing: Theme.spacingSm) {
                                Circle()
                                    .fill(Theme.secondary)
                                    .frame(width: 7, height: 7)
                                    .padding(.top, 6)
                                Text(item)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.onSurface)
                            }
                        }
                    }
                }
            }
        }
    }
}

private struct ConsultationRecordingCard: View {
    let recording: AudioRecording

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                HStack {
                    Text("Recording")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)
                    Spacer()
                    CSBadge(text: "Available", variant: .success)
                }

                VStack(alignment: .leading, spacing: Theme.spacingXS) {
                    Text(recording.fileName)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.onSurface)
                    Text("Captured \(DateFormatters.formatDuration(seconds: recording.durationSeconds)) • \(recording.mimeType)")
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }
        }
    }
}

private struct ConsultationDangerZoneCard: View {
    let isDeleting: Bool
    let onDelete: () -> Void

    var body: some View {
        CSCard(variant: .filled) {
            VStack(alignment: .leading, spacing: Theme.spacingMd) {
                Text("Danger Zone")
                    .font(.headline)
                    .foregroundStyle(Theme.error)

                Text("Delete this consultation if it was created in error or should no longer appear in the workspace.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.onSurfaceVariant)

                CSButton(
                    title: isDeleting ? "Deleting..." : "Delete Consultation",
                    variant: .danger,
                    size: .sm,
                    isLoading: isDeleting
                ) {
                    onDelete()
                }
                .disabled(isDeleting)
            }
        }
    }
}

private struct ErrorBanner: View {
    let message: String
    let onRetry: () -> Void

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(Theme.error)
                .accessibilityHidden(true)

            Text(message)
                .font(.caption)
                .foregroundStyle(Theme.onSurface)

            Spacer()

            Button("Retry") {
                onRetry()
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(Theme.primary)
        }
        .padding(Theme.spacingSm)
        .background(Theme.errorContainer.opacity(0.6))
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))
    }
}

// MARK: - Status Timeline

private struct StatusTimeline: View {
    let currentStatus: ConsultationStatus

    private let steps: [ConsultationStatus] = [
        .scheduled, .briefReady, .recording, .transcribing, .generating, .reviewPending, .approved, .closeoutPending, .closed, .exported
    ]

    private var currentIndex: Int {
        steps.firstIndex(of: currentStatus) ?? 0
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            Text("Progress")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.onSurface)

            HStack(spacing: 0) {
                ForEach(Array(steps.enumerated()), id: \.offset) { item in
                    let index = item.offset
                    let step = item.element
                    if index > 0 {
                        Rectangle()
                            .fill(index <= currentIndex ? Theme.primary : Theme.outlineVariant)
                            .frame(height: 2)
                    }

                    VStack(spacing: Theme.spacingXS) {
                        ZStack {
                            if index < currentIndex {
                                Circle()
                                    .fill(Theme.primary)
                                    .frame(width: 24, height: 24)
                                Image(systemName: "checkmark")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundStyle(Theme.onPrimary)
                            } else if index == currentIndex {
                                Circle()
                                    .fill(Theme.secondary)
                                    .frame(width: 24, height: 24)
                                Circle()
                                    .fill(Theme.onPrimary)
                                    .frame(width: 8, height: 8)
                            } else {
                                Circle()
                                    .stroke(Theme.outlineVariant, lineWidth: 2)
                                    .frame(width: 24, height: 24)
                            }
                        }

                        Text(step.shortLabel)
                            .font(.system(size: 8, weight: index == currentIndex ? .bold : .regular))
                            .foregroundStyle(index <= currentIndex ? Theme.onSurface : Theme.onSurfaceVariant)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    .frame(maxWidth: index == 0 || index == steps.count - 1 ? nil : .infinity)
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Consultation progress: \(currentStatus.label)")
    }
}
