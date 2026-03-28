import Foundation
import Supabase

@MainActor
final class PatientDetailViewModel: ObservableObject {
    @Published var patient: Patient?
    @Published var consultations: [Consultation] = []
    @Published var isLoading = true

    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    func load(patientId: UUID) async {
        isLoading = true
        do {
            patient = try await PatientService.shared.getPatient(id: patientId)

            let results: [Consultation] = try await supabase.from("consultations")
                .select("*, clinician:profiles(*)")
                .eq("patient_id", value: patientId.uuidString)
                .order("started_at", ascending: false)
                .execute()
                .value
            consultations = results
        } catch {
            print("Patient detail error: \(error)")
        }
        isLoading = false
    }
}
