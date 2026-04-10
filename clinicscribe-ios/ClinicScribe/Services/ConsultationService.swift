import Foundation
import Supabase

@MainActor
final class ConsultationService {
    static let shared = ConsultationService()
    private var supabase: SupabaseClient { SupabaseManager.shared.client }
    private let decoder = JSONDecoder()
    private init() {}

    func getConsultations(clinicId: UUID, status: ConsultationStatus? = nil) async throws -> [Consultation] {
        var query = supabase.from("consultations")
            .select("*, patient:patients(*), clinician:profiles(*), visit_brief:visit_briefs(*)")
            .eq("clinic_id", value: clinicId.uuidString)

        if let status {
            query = query.eq("status", value: status.rawValue)
        }

        let response = try await query
            .order("started_at", ascending: false)
            .execute()

        return try decodeConsultationArray(from: response.data)
    }

    func getConsultation(id: UUID) async throws -> Consultation {
        let response = try await supabase.from("consultations")
            .select("*, patient:patients(*), clinician:profiles(*), audio_recording:audio_recordings(*), transcript:transcripts(*), clinical_note:clinical_notes(*), visit_brief:visit_briefs(*), care_tasks:care_tasks(*), generated_documents:generated_documents(*)")
            .eq("id", value: id.uuidString)
            .single()
            .execute()

        return try decodeConsultation(from: response.data)
    }

    struct ConsultationInput: Encodable {
        let clinic_id: UUID
        let patient_id: UUID
        let clinician_id: UUID
        let consultation_type: String
        let template_key: String?
        let status: ConsultationStatus
        let scheduled_for: String
        let reason_for_visit: String
        let source: String
        let started_at: String
    }

    func createConsultation(_ input: ConsultationInput) async throws -> Consultation {
        do {
            let response = try await supabase.from("consultations")
                .insert(input)
                .select("*, patient:patients(*)")
                .single()
                .execute()

            return try decodeConsultation(from: response.data)
        } catch {
            struct FallbackInput: Encodable {
                let clinic_id: UUID
                let patient_id: UUID
                let clinician_id: UUID
                let consultation_type: String
                let status: ConsultationStatus
                let started_at: String
            }

            let response = try await supabase.from("consultations")
                .insert(FallbackInput(
                    clinic_id: input.clinic_id,
                    patient_id: input.patient_id,
                    clinician_id: input.clinician_id,
                    consultation_type: input.consultation_type,
                    status: .recording,
                    started_at: input.started_at
                ))
                .select("*, patient:patients(*)")
                .single()
                .execute()

            return try decodeConsultation(from: response.data)
        }
    }

    func updateStatus(id: UUID, status: ConsultationStatus) async throws {
        var updates: [String: String] = ["status": status.rawValue]
        if status == .approved || status == .closed || status == .exported {
            updates["completed_at"] = ISO8601DateFormatter().string(from: Date())
        }
        try await supabase.from("consultations")
            .update(updates)
            .eq("id", value: id.uuidString)
            .execute()
    }

    func deleteConsultation(id: UUID) async throws {
        try await supabase.from("consultations")
            .delete()
            .eq("id", value: id.uuidString)
            .execute()
    }

    func getRecentConsultations(clinicId: UUID, limit: Int = 5) async throws -> [Consultation] {
        let response = try await supabase.from("consultations")
            .select("*, patient:patients(*)")
            .eq("clinic_id", value: clinicId.uuidString)
            .order("started_at", ascending: false)
            .limit(limit)
            .execute()

        return try decodeConsultationArray(from: response.data)
    }

    func getConsultationsForPatient(clinicId: UUID, patientId: UUID) async throws -> [Consultation] {
        let response = try await supabase.from("consultations")
            .select("id, clinic_id, patient_id, clinician_id, status, consultation_type, template_key, scheduled_for, reason_for_visit, source, duration_seconds, started_at, completed_at, created_at, updated_at")
            .eq("clinic_id", value: clinicId.uuidString)
            .eq("patient_id", value: patientId.uuidString)
            .order("started_at", ascending: false)
            .execute()

        return try decoder.decode([Consultation].self, from: response.data)
    }

    private func decodeConsultationArray(from data: Data) throws -> [Consultation] {
        guard var json = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
            return try decoder.decode([Consultation].self, from: data)
        }

        for index in json.indices {
            normalizeConsultationJSON(&json[index])
        }

        let normalizedData = try JSONSerialization.data(withJSONObject: json)
        return try decoder.decode([Consultation].self, from: normalizedData)
    }

    private func decodeConsultation(from data: Data) throws -> Consultation {
        guard var json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return try decoder.decode(Consultation.self, from: data)
        }

        normalizeConsultationJSON(&json)
        let normalizedData = try JSONSerialization.data(withJSONObject: json)
        return try decoder.decode(Consultation.self, from: normalizedData)
    }

    private func normalizeConsultationJSON(_ json: inout [String: Any]) {
        if let audioRecording = json["audio_recording"] as? [[String: Any]] {
            json["audio_recording"] = audioRecording.first
        }

        if let transcript = json["transcript"] as? [[String: Any]] {
            json["transcript"] = transcript.first
        }

        if let notes = json["clinical_note"] as? [[String: Any]] {
            json["clinical_note"] = notes.last
        }

        if let visitBrief = json["visit_brief"] as? [[String: Any]] {
            json["visit_brief"] = visitBrief.first
        }
    }
}
