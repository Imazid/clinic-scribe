import Foundation
import Supabase

struct NoteGenerationRequest: Encodable {
    let transcript: String
    let patientContext: String?
    let consultationId: String
}

struct NoteGenerationResponse: Decodable {
    let content: SOAPNote
    let confidenceScores: ConfidenceScores
    let medications: [MedicationDraft]
    let followUpTasks: [FollowUpTask]
    let referrals: [String]

    enum CodingKeys: String, CodingKey {
        case content
        case confidenceScores = "confidence_scores"
        case medications
        case followUpTasks = "follow_up_tasks"
        case referrals
    }
}

@MainActor
final class NoteGenerationService {
    static let shared = NoteGenerationService()
    private var supabase: SupabaseClient { SupabaseManager.shared.client }
    private init() {}

    func generateNote(consultationId: UUID, transcript: String, patientContext: String? = nil) async throws -> ClinicalNote {
        let response: NoteGenerationResponse = try await APIClient.shared.request(
            method: "POST",
            path: "/api/generate-note",
            body: NoteGenerationRequest(
                transcript: transcript,
                patientContext: patientContext,
                consultationId: consultationId.uuidString
            )
        )

        // Store note in Supabase
        struct NoteInsert: Encodable {
            let consultation_id: UUID
            let content: SOAPNote
            let confidence_scores: ConfidenceScores
            let medications: [MedicationDraft]
            let follow_up_tasks: [FollowUpTask]
            let referrals: [String]
            let ai_model: String
            let ai_prompt_version: String
        }

        let note: ClinicalNote = try await supabase.from("clinical_notes")
            .insert(NoteInsert(
                consultation_id: consultationId,
                content: response.content,
                confidence_scores: response.confidenceScores,
                medications: response.medications,
                follow_up_tasks: response.followUpTasks,
                referrals: response.referrals,
                ai_model: "gpt-4o",
                ai_prompt_version: "1.0.0"
            ))
            .select()
            .single()
            .execute()
            .value

        return note
    }

    func approveNote(noteId: UUID, content: SOAPNote, medications: [MedicationDraft], followUpTasks: [FollowUpTask], referrals: [String], approvedBy: UUID) async throws {
        struct NoteUpdate: Encodable {
            let content: SOAPNote
            let medications: [MedicationDraft]
            let follow_up_tasks: [FollowUpTask]
            let referrals: [String]
            let is_approved: Bool
            let approved_by: UUID
            let approved_at: String
        }

        try await supabase.from("clinical_notes")
            .update(NoteUpdate(
                content: content,
                medications: medications,
                follow_up_tasks: followUpTasks,
                referrals: referrals,
                is_approved: true,
                approved_by: approvedBy,
                approved_at: ISO8601DateFormatter().string(from: Date())
            ))
            .eq("id", value: noteId.uuidString)
            .execute()
    }
}
