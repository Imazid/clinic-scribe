import Foundation
import Supabase

@MainActor
final class CareTaskService {
    static let shared = CareTaskService()

    private let decoder = JSONDecoder()
    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    private init() {}

    struct CreateTaskInput: Encodable {
        let clinic_id: UUID
        let patient_id: UUID
        let consultation_id: UUID
        let title: String
        let description: String
        let due_at: String?
        let status: CareTaskStatus
        let category: CareTaskCategory
        let owner_user_id: UUID?
        let source: String
    }

    func getTasks(clinicId: UUID) async throws -> [CareTask] {
        let response = try await supabase.from("care_tasks")
            .select("*, patient:patients(*), consultation:consultations(id, consultation_type, status, started_at)")
            .eq("clinic_id", value: clinicId.uuidString)
            .order("created_at", ascending: false)
            .execute()

        return try decodeTaskArray(from: response.data)
    }

    func createTask(_ input: CreateTaskInput) async throws -> CareTask {
        let response = try await supabase.from("care_tasks")
            .insert(input)
            .select("*, patient:patients(*), consultation:consultations(id, consultation_type, status, started_at)")
            .single()
            .execute()

        return try decodeTask(from: response.data)
    }

    func updateTaskStatus(id: UUID, status: CareTaskStatus) async throws -> CareTask {
        struct UpdatePayload: Encodable {
            let status: CareTaskStatus
            let updated_at: String
            let completed_at: String?
        }

        let response = try await supabase.from("care_tasks")
            .update(UpdatePayload(
                status: status,
                updated_at: DateFormatters.iso8601.string(from: Date()),
                completed_at: status == .completed ? DateFormatters.iso8601.string(from: Date()) : nil
            ))
            .eq("id", value: id.uuidString)
            .select("*, patient:patients(*), consultation:consultations(id, consultation_type, status, started_at)")
            .single()
            .execute()

        return try decodeTask(from: response.data)
    }

    private func decodeTaskArray(from data: Data) throws -> [CareTask] {
        guard var json = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
            return try decoder.decode([CareTask].self, from: data)
        }

        for index in json.indices {
            normalizeTaskJSON(&json[index])
        }

        return try decoder.decode([CareTask].self, from: JSONSerialization.data(withJSONObject: json))
    }

    private func decodeTask(from data: Data) throws -> CareTask {
        guard var json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return try decoder.decode(CareTask.self, from: data)
        }

        normalizeTaskJSON(&json)
        return try decoder.decode(CareTask.self, from: JSONSerialization.data(withJSONObject: json))
    }

    private func normalizeTaskJSON(_ json: inout [String: Any]) {
        if let patient = json["patient"] as? [[String: Any]] {
            json["patient"] = patient.first
        }

        if let consultation = json["consultation"] as? [[String: Any]] {
            json["consultation"] = consultation.first
        }
    }
}
