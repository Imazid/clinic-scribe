import Foundation

@MainActor
final class NewConsultationViewModel: ObservableObject {
    @Published var patients: [Patient] = []
    @Published var selectedPatientId: UUID?
    @Published var consultationType = "Standard Consultation"
    @Published var patientSearch = ""
    @Published var isCreating = false
    @Published var errorMessage: String?

    var clinicId: UUID?
    var clinicianId: UUID?

    var filteredPatients: [Patient] {
        guard !patientSearch.isEmpty else { return patients }
        return patients.filter { $0.fullName.lowercased().contains(patientSearch.lowercased()) }
    }

    func loadPatients() async {
        guard let clinicId else { return }
        do {
            patients = try await PatientService.shared.getPatients(clinicId: clinicId)
        } catch {
            print("Load patients error: \(error)")
        }
    }

    func createConsultation(templateKey: String?) async -> Consultation? {
        guard let clinicId, let clinicianId, let patientId = selectedPatientId else {
            errorMessage = "Please select a patient"
            return nil
        }
        isCreating = true
        errorMessage = nil
        do {
            let consultation = try await ConsultationService.shared.createConsultation(
                ConsultationService.ConsultationInput(
                    clinic_id: clinicId,
                    patient_id: patientId,
                    clinician_id: clinicianId,
                    consultation_type: consultationType,
                    template_key: templateKey,
                    status: .recording,
                    scheduled_for: DateFormatters.iso8601.string(from: Date()),
                    reason_for_visit: consultationType,
                    source: "manual",
                    started_at: DateFormatters.iso8601.string(from: Date())
                )
            )
            isCreating = false
            return consultation
        } catch {
            errorMessage = error.localizedDescription
            isCreating = false
            return nil
        }
    }
}
