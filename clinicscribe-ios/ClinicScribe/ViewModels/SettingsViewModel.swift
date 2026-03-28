import Foundation
import Supabase

@MainActor
final class SettingsViewModel: ObservableObject {
    @Published var profile: Profile?
    @Published var clinic: Clinic?
    @Published var firstName = ""
    @Published var lastName = ""
    @Published var specialty = ""
    @Published var providerNumber = ""
    @Published var isSaving = false

    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    func load() async {
        guard let userId = AuthService.shared.currentUserId else { return }
        do {
            let profiles: [Profile] = try await supabase.from("profiles")
                .select()
                .eq("user_id", value: userId.uuidString)
                .limit(1)
                .execute()
                .value
            if let p = profiles.first {
                profile = p
                firstName = p.firstName
                lastName = p.lastName
                specialty = p.specialty ?? ""
                providerNumber = p.providerNumber ?? ""
            }

            if let clinicId = profile?.clinicId {
                let clinics: [Clinic] = try await supabase.from("clinics")
                    .select()
                    .eq("id", value: clinicId.uuidString)
                    .limit(1)
                    .execute()
                    .value
                clinic = clinics.first
            }
        } catch {
            print("Settings load error: \(error)")
        }
    }

    func saveProfile() async {
        guard let profileId = profile?.id else { return }
        isSaving = true
        do {
            try await supabase.from("profiles")
                .update([
                    "first_name": firstName,
                    "last_name": lastName,
                    "specialty": specialty,
                    "provider_number": providerNumber,
                ])
                .eq("id", value: profileId.uuidString)
                .execute()
        } catch {
            print("Save profile error: \(error)")
        }
        isSaving = false
    }
}
