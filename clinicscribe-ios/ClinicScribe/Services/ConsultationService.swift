import Foundation
import Supabase

@MainActor
final class ConsultationService {
    static let shared = ConsultationService()
    private var supabase: SupabaseClient { SupabaseManager.shared.client }
    private init() {}

    func getConsultations(clinicId: UUID, status: ConsultationStatus? = nil) async throws -> [Consultation] {
        var query = supabase.from("consultations")
            .select("*, patient:patients(*), clinician:profiles(*)")
            .eq("clinic_id", value: clinicId.uuidString)

        if let status {
            query = query.eq("status", value: status.rawValue)
        }

        return try await query
            .order("started_at", ascending: false)
            .execute()
            .value
    }

    func getConsultation(id: UUID) async throws -> Consultation {
        try await supabase.from("consultations")
            .select("*, patient:patients(*), clinician:profiles(*), transcript:transcripts(*), clinical_note:clinical_notes(*)")
            .eq("id", value: id.uuidString)
            .single()
            .execute()
            .value
    }

    struct ConsultationInput: Encodable {
        let clinic_id: UUID
        let patient_id: UUID
        let clinician_id: UUID
        let consultation_type: String
    }

    func createConsultation(_ input: ConsultationInput) async throws -> Consultation {
        try await supabase.from("consultations")
            .insert(input)
            .select("*, patient:patients(*)")
            .single()
            .execute()
            .value
    }

    func updateStatus(id: UUID, status: ConsultationStatus) async throws {
        var updates: [String: String] = ["status": status.rawValue]
        if status == .approved {
            updates["completed_at"] = ISO8601DateFormatter().string(from: Date())
        }
        try await supabase.from("consultations")
            .update(updates)
            .eq("id", value: id.uuidString)
            .execute()
    }

    func getRecentConsultations(clinicId: UUID, limit: Int = 5) async throws -> [Consultation] {
        try await supabase.from("consultations")
            .select("*, patient:patients(*)")
            .eq("clinic_id", value: clinicId.uuidString)
            .order("started_at", ascending: false)
            .limit(limit)
            .execute()
            .value
    }
}
