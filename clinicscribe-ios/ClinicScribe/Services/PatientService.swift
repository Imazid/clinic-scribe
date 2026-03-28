import Foundation
import Supabase

@MainActor
final class PatientService {
    static let shared = PatientService()
    private var supabase: SupabaseClient { SupabaseManager.shared.client }
    private init() {}

    func getPatients(clinicId: UUID, search: String? = nil, consentFilter: ConsentStatus? = nil) async throws -> [Patient] {
        var query = supabase.from("patients")
            .select()
            .eq("clinic_id", value: clinicId.uuidString)

        if let filter = consentFilter {
            query = query.eq("consent_status", value: filter.rawValue)
        }

        let patients: [Patient] = try await query
            .order("last_name")
            .execute()
            .value

        guard let search = search?.lowercased(), !search.isEmpty else {
            return patients
        }
        return patients.filter { $0.fullName.lowercased().contains(search) }
    }

    func getPatient(id: UUID) async throws -> Patient {
        try await supabase.from("patients")
            .select()
            .eq("id", value: id.uuidString)
            .single()
            .execute()
            .value
    }

    struct PatientInput: Encodable {
        let clinic_id: UUID
        let first_name: String
        let last_name: String
        let date_of_birth: String
        let sex: String
        let email: String?
        let phone: String?
        let mrn: String?
        let medicare_number: String?
        let ihi: String?
        let allergies: [String]
        let conditions: [String]
        let consent_status: String
        let notes: String?
    }

    func createPatient(_ input: PatientInput) async throws -> Patient {
        try await supabase.from("patients")
            .insert(input)
            .select()
            .single()
            .execute()
            .value
    }

    func updatePatient(id: UUID, _ input: PatientInput) async throws -> Patient {
        try await supabase.from("patients")
            .update(input)
            .eq("id", value: id.uuidString)
            .select()
            .single()
            .execute()
            .value
    }
}
