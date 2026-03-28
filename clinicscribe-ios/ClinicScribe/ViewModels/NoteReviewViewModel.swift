import Foundation

@MainActor
final class NoteReviewViewModel: ObservableObject {
    @Published var note: ClinicalNote?
    @Published var transcript: Transcript?
    @Published var subjective = ""
    @Published var objective = ""
    @Published var assessment = ""
    @Published var plan = ""
    @Published var medications: [MedicationDraft] = []
    @Published var followUpTasks: [FollowUpTask] = []
    @Published var referrals: [String] = []
    @Published var isApproving = false
    @Published var isGenerating = false
    @Published var errorMessage: String?

    func load(consultation: Consultation) async {
        if let existing = consultation.clinicalNote {
            populateFrom(existing)
        } else if let t = consultation.transcript {
            transcript = t
            isGenerating = true
            do {
                let generated = try await NoteGenerationService.shared.generateNote(
                    consultationId: consultation.id,
                    transcript: t.fullText
                )
                populateFrom(generated)
                try await ConsultationService.shared.updateStatus(
                    id: consultation.id, status: .reviewPending
                )
            } catch {
                errorMessage = error.localizedDescription
            }
            isGenerating = false
        }
    }

    private func populateFrom(_ note: ClinicalNote) {
        self.note = note
        subjective = note.content.subjective
        objective = note.content.objective
        assessment = note.content.assessment
        plan = note.content.plan
        medications = note.medications
        followUpTasks = note.followUpTasks
        referrals = note.referrals
    }

    func approve(consultationId: UUID, approvedBy: UUID) async -> Bool {
        guard let note else { return false }
        isApproving = true
        do {
            let content = SOAPNote(subjective: subjective, objective: objective, assessment: assessment, plan: plan)
            try await NoteGenerationService.shared.approveNote(
                noteId: note.id, content: content,
                medications: medications, followUpTasks: followUpTasks,
                referrals: referrals, approvedBy: approvedBy
            )
            try await ConsultationService.shared.updateStatus(id: consultationId, status: .approved)
            isApproving = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isApproving = false
            return false
        }
    }
}
