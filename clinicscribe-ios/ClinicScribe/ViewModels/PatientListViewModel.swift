import Foundation

@MainActor
final class PatientListViewModel: ObservableObject {
    @Published var patients: [Patient] = []
    @Published var searchText = ""
    @Published var consentFilter: ConsentStatus?
    @Published var isLoading = true
    @Published var errorMessage: String?

    var clinicId: UUID?

    var filteredPatients: [Patient] {
        let normalizedQuery = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !normalizedQuery.isEmpty else { return patients }

        return patients.filter { patient in
            patient.fullName.lowercased().contains(normalizedQuery)
        }
    }

    func load() async {
        guard let clinicId else {
            print("⚠️ PatientListVM: clinicId is nil, cannot load patients")
            isLoading = false
            return
        }
        isLoading = true
        errorMessage = nil
        do {
            patients = try await PatientService.shared.getPatients(
                clinicId: clinicId,
                search: nil,
                consentFilter: consentFilter
            )
        } catch {
            print("❌ Patient load error: \(error)")
            errorMessage = "Failed to load patients: \(error.localizedDescription)"
        }
        isLoading = false
    }
}
