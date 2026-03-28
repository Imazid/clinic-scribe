import Foundation
import Supabase

struct ConsultationTypeStat: Identifiable {
    let id = UUID()
    let type: String
    let count: Int
}

@MainActor
final class AnalyticsViewModel: ObservableObject {
    @Published var totalConsultations = 0
    @Published var approvedNotes = 0
    @Published var approvalRate: Double = 0
    @Published var consultationsByType: [ConsultationTypeStat] = []
    @Published var isLoading = true

    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    private struct AnalyticsRow: Codable {
        let id: UUID
        let status: ConsultationStatus
        let consultationType: String

        enum CodingKeys: String, CodingKey {
            case id, status
            case consultationType = "consultation_type"
        }
    }

    func load(clinicId: UUID) async {
        isLoading = true
        do {
            let all: [AnalyticsRow] = try await supabase.from("consultations")
                .select("id, status, consultation_type")
                .eq("clinic_id", value: clinicId.uuidString)
                .execute()
                .value
            totalConsultations = all.count

            approvedNotes = all.filter { $0.status == .approved || $0.status == .exported }.count
            approvalRate = totalConsultations > 0 ? Double(approvedNotes) / Double(totalConsultations) * 100 : 0

            var typeCounts: [String: Int] = [:]
            for c in all {
                typeCounts[c.consultationType, default: 0] += 1
            }
            consultationsByType = typeCounts.map { ConsultationTypeStat(type: $0.key, count: $0.value) }
                .sorted { $0.count > $1.count }
        } catch {
            print("❌ Analytics error: \(error)")
        }
        isLoading = false
    }
}
