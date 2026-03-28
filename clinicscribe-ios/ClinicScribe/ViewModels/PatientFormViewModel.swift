import Foundation

@MainActor
final class PatientFormViewModel: ObservableObject {
    @Published var firstName = ""
    @Published var lastName = ""
    @Published var dateOfBirth = Date()
    @Published var sex: Sex = .other
    @Published var email = ""
    @Published var phone = ""
    @Published var mrn = ""
    @Published var medicareNumber = ""
    @Published var ihi = ""
    @Published var allergies = ""
    @Published var conditions = ""
    @Published var notes = ""
    @Published var isLoading = false
    @Published var errorMessage: String?

    var clinicId: UUID?
    var editingPatient: Patient?

    func populateForEdit(_ patient: Patient) {
        editingPatient = patient
        firstName = patient.firstName
        lastName = patient.lastName
        sex = patient.sex
        email = patient.email ?? ""
        phone = patient.phone ?? ""
        mrn = patient.mrn ?? ""
        medicareNumber = patient.medicareNumber ?? ""
        ihi = patient.ihi ?? ""
        allergies = patient.allergies.joined(separator: ", ")
        conditions = patient.conditions.joined(separator: ", ")
        notes = patient.notes ?? ""
    }

    private var input: PatientService.PatientInput {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"

        return PatientService.PatientInput(
            clinic_id: clinicId!,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: editingPatient?.dateOfBirth ?? dateFormatter.string(from: dateOfBirth),
            sex: sex.rawValue,
            email: email.isEmpty ? nil : email,
            phone: phone.isEmpty ? nil : phone,
            mrn: mrn.isEmpty ? nil : mrn,
            medicare_number: medicareNumber.isEmpty ? nil : medicareNumber,
            ihi: ihi.isEmpty ? nil : ihi,
            allergies: allergies.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) },
            conditions: conditions.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) },
            consent_status: "pending",
            notes: notes.isEmpty ? nil : notes
        )
    }

    func save() async -> Patient? {
        guard !firstName.isEmpty, !lastName.isEmpty else {
            errorMessage = "First and last name are required"
            return nil
        }
        guard clinicId != nil else {
            errorMessage = "Unable to determine clinic. Please sign out and sign in again."
            return nil
        }
        isLoading = true
        errorMessage = nil
        do {
            if let existing = editingPatient {
                let patient = try await PatientService.shared.updatePatient(id: existing.id, input)
                isLoading = false
                return patient
            } else {
                let patient = try await PatientService.shared.createPatient(input)
                isLoading = false
                return patient
            }
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return nil
        }
    }
}
