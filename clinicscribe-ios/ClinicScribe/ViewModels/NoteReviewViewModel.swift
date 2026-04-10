import Foundation

@MainActor
final class NoteReviewViewModel: ObservableObject {
    @Published var note: ClinicalNote?
    @Published var transcript: Transcript?
    @Published var selectedTemplate: NoteTemplate = NoteTemplateCatalog.defaultTemplate
    @Published var subjective = ""
    @Published var objective = ""
    @Published var assessment = ""
    @Published var plan = ""
    @Published var medications: [MedicationDraft] = []
    @Published var followUpTasks: [FollowUpTask] = []
    @Published var referrals: [String] = []
    @Published var verificationStatus: NoteVerificationStatus?
    @Published var provenance: [NoteProvenanceItem] = []
    @Published var qaFindings: [NoteQAFinding] = []
    @Published var patientSummarySnapshot: PatientSummarySnapshot?
    @Published var isApproving = false
    @Published var isGenerating = false
    @Published var errorMessage: String?

    func load(consultation: Consultation) async {
        transcript = consultation.transcript
        errorMessage = nil

        if let existing = consultation.clinicalNote {
            populateFrom(existing)
        }

        let resolvedTemplate = await TemplateLibraryService.shared.resolveTemplate(
            key: consultation.clinicalNote?.templateKey ?? consultation.templateKey,
            clinicId: consultation.clinicId
        )

        if let resolvedTemplate {
            selectedTemplate = resolvedTemplate
        } else {
            selectedTemplate = NoteTemplateCatalog.suggestedTemplate(
                for: consultation.consultationType,
                transcript: consultation.transcript?.fullText
            )
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
        verificationStatus = note.verificationStatus
        provenance = note.provenance ?? []
        qaFindings = note.qaFindings ?? []
        patientSummarySnapshot = note.patientSummarySnapshot
    }

    func generate(consultationId: UUID, transcript: String) async -> Bool {
        guard !isGenerating else { return false }
        isGenerating = true
        errorMessage = nil
        do {
            let generated = try await NoteGenerationService.shared.generateNote(
                consultationId: consultationId,
                transcript: transcript,
                template: selectedTemplate
            )
            populateFrom(generated)
            try await ConsultationService.shared.updateStatus(id: consultationId, status: .reviewPending)
            isGenerating = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isGenerating = false
            return false
        }
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
