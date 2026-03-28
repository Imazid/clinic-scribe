import Foundation
import Supabase

@MainActor
final class AuditService {
    static let shared = AuditService()
    private var supabase: SupabaseClient { SupabaseManager.shared.client }
    private init() {}

    struct AuditInsert: Encodable {
        let clinic_id: UUID
        let user_id: UUID
        let action: String
        let entity_type: String
        let entity_id: String
    }

    func log(clinicId: UUID, userId: UUID, action: String, entityType: String, entityId: String) async {
        do {
            try await supabase.from("audit_logs")
                .insert(AuditInsert(
                    clinic_id: clinicId,
                    user_id: userId,
                    action: action,
                    entity_type: entityType,
                    entity_id: entityId
                ))
                .execute()
        } catch {
            print("Audit log failed: \(error.localizedDescription)")
        }
    }

    func getAuditLogs(clinicId: UUID, search: String? = nil) async throws -> [AuditLog] {
        let logs: [AuditLog] = try await supabase.from("audit_logs")
            .select("*, user:profiles(*)")
            .eq("clinic_id", value: clinicId.uuidString)
            .order("created_at", ascending: false)
            .limit(200)
            .execute()
            .value

        guard let search = search?.lowercased(), !search.isEmpty else {
            return logs
        }
        return logs.filter {
            $0.action.lowercased().contains(search) ||
            $0.entityType.lowercased().contains(search)
        }
    }
}
