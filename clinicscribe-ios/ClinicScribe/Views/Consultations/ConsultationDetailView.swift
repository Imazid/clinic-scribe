import SwiftUI

struct ConsultationDetailView: View {
    let consultationId: UUID
    @StateObject private var vm = ConsultationDetailViewModel()

    var body: some View {
        ScrollView {
            if let c = vm.consultation {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    // Status Timeline
                    StatusTimeline(currentStatus: c.status)
                        .cardStyle()

                    // Patient Card
                    HStack(spacing: Theme.spacingMd) {
                        CSAvatar(initials: c.patient?.initials ?? "?", size: 48)
                        VStack(alignment: .leading, spacing: Theme.spacingXS) {
                            Text(c.patient?.fullName ?? "Unknown")
                                .font(.title3.weight(.semibold))
                                .foregroundStyle(Theme.primary)
                            CSBadge(text: c.status.label, variant: c.status.badgeVariant)
                        }
                        Spacer()
                    }
                    .accessibilityElement(children: .combine)
                    .cardStyle()

                    // Details
                    CSCard {
                        VStack(alignment: .leading, spacing: Theme.spacingSm) {
                            InfoRow(icon: "stethoscope", text: c.consultationType)
                            InfoRow(icon: "calendar", text: DateFormatters.formatISO(c.startedAt))
                            InfoRow(
                                icon: "clock",
                                text: c.durationSeconds.map { DateFormatters.formatDuration(seconds: $0) } ?? "Not yet recorded"
                            )
                            InfoRow(
                                icon: "person",
                                text: c.clinician?.fullName ?? (c.clinicianId.uuidString.isEmpty ? "Unknown" : "Clinician")
                            )
                            if let clinician = c.clinician, let specialty = clinician.specialty {
                                InfoRow(icon: "cross.case", text: specialty)
                            }
                        }
                    }

                    // Transcript
                    if let transcript = c.transcript {
                        TranscriptViewer(transcript: transcript)
                    }

                    // Actions
                    if c.status == .reviewPending || c.status == .generating {
                        NavigationLink {
                            NoteReviewView(consultation: c)
                        } label: {
                            HStack(spacing: Theme.spacingSm) {
                                Image(systemName: "doc.text.magnifyingglass")
                                Text("Review Note")
                                    .font(.body.weight(.semibold))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, CSButtonSize.md.verticalPadding)
                            .foregroundStyle(Theme.onPrimary)
                            .background(Theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                        }
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
        .refreshable { await vm.load(id: consultationId) }
        .task { await vm.load(id: consultationId) }
    }
}

// MARK: - Status Timeline

private struct StatusTimeline: View {
    let currentStatus: ConsultationStatus

    private let steps: [ConsultationStatus] = [
        .recording, .transcribing, .generating, .reviewPending, .approved, .exported
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
                        // Connecting line
                        Rectangle()
                            .fill(index <= currentIndex ? Theme.primary : Theme.outlineVariant)
                            .frame(height: 2)
                    }

                    VStack(spacing: Theme.spacingXS) {
                        ZStack {
                            if index < currentIndex {
                                // Completed step
                                Circle()
                                    .fill(Theme.primary)
                                    .frame(width: 24, height: 24)
                                Image(systemName: "checkmark")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundStyle(Theme.onPrimary)
                            } else if index == currentIndex {
                                // Current step
                                Circle()
                                    .fill(Theme.secondary)
                                    .frame(width: 24, height: 24)
                                Circle()
                                    .fill(Theme.onPrimary)
                                    .frame(width: 8, height: 8)
                            } else {
                                // Future step
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

