import Foundation
import Supabase

private struct IdRow: Codable {
    let id: UUID
}

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var totalPatients = 0
    @Published var consultationsThisWeek = 0
    @Published var pendingReviews = 0
    @Published var recentConsultations: [Consultation] = []
    @Published var profile: Profile?
    @Published var clinic: Clinic?
    @Published var isLoading = true

    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    func load() async {
        isLoading = true
        do {
            // Use AuthService's profile instead of querying again
            let authProfile = AuthService.shared.currentProfile
            if authProfile != nil {
                profile = authProfile
            } else {
                // Fallback: query profile if AuthService hasn't loaded yet
                guard let userId = AuthService.shared.currentUserId else {
                    isLoading = false
                    return
                }
                let profiles: [Profile] = try await supabase.from("profiles")
                    .select()
                    .eq("user_id", value: userId.uuidString)
                    .limit(1)
                    .execute()
                    .value
                profile = profiles.first
            }

            guard let clinicId = profile?.clinicId else {
                print("⚠️ Dashboard: No clinicId found on profile")
                isLoading = false
                return
            }

            // Load clinic info
            let clinics: [Clinic] = try await supabase.from("clinics")
                .select()
                .eq("id", value: clinicId.uuidString)
                .limit(1)
                .execute()
                .value
            clinic = clinics.first

            // Count patients (use lightweight IdRow instead of full Patient)
            let patients: [IdRow] = try await supabase.from("patients")
                .select("id")
                .eq("clinic_id", value: clinicId.uuidString)
                .execute()
                .value
            totalPatients = patients.count

            // Count this week's consultations
            let startOfWeek = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
            let isoStart = ISO8601DateFormatter().string(from: startOfWeek)
            let weekConsultations: [IdRow] = try await supabase.from("consultations")
                .select("id")
                .eq("clinic_id", value: clinicId.uuidString)
                .gte("started_at", value: isoStart)
                .execute()
                .value
            consultationsThisWeek = weekConsultations.count

            // Pending reviews
            let pending: [IdRow] = try await supabase.from("consultations")
                .select("id")
                .eq("clinic_id", value: clinicId.uuidString)
                .eq("status", value: "review_pending")
                .execute()
                .value
            pendingReviews = pending.count

            // Recent consultations
            recentConsultations = try await ConsultationService.shared.getRecentConsultations(clinicId: clinicId)
        } catch {
            print("❌ Dashboard load error: \(error)")
        }
        isLoading = false
    }
}
