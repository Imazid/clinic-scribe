import SwiftUI

struct NoteReviewView: View {
    let consultation: Consultation
    @StateObject private var vm = NoteReviewViewModel()
    @Environment(\.dismiss) private var dismiss

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
                } else {
                    // Confidence
                    if let note = vm.note {
                        ConfidenceIndicator(scores: note.confidenceScores)
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

                    if let error = vm.errorMessage {
                        Text(error).font(.caption).foregroundStyle(Theme.error)
                    }
                }
            }
            .padding(Theme.spacingMd)
        }
        .background(Theme.surface)
        .navigationTitle("Review Note")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
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
        }
        .task { await vm.load(consultation: consultation) }
    }
}
