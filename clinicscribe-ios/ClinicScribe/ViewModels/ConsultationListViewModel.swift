import Foundation

@MainActor
final class ConsultationListViewModel: ObservableObject {
    @Published var consultations: [Consultation] = []
    @Published var searchText = ""
    @Published var statusFilter: ConsultationStatus?
    @Published var isLoading = true
    @Published var errorMessage: String?

    var clinicId: UUID?

    var filteredConsultations: [Consultation] {
        guard !searchText.isEmpty else { return consultations }
        return consultations.filter {
            $0.patient?.fullName.lowercased().contains(searchText.lowercased()) ?? false
        }
    }

    func load() async {
        guard let clinicId else {
            print("⚠️ ConsultationListVM: clinicId is nil, cannot load consultations")
            isLoading = false
            return
        }
        isLoading = true
        errorMessage = nil
        do {
            consultations = try await ConsultationService.shared.getConsultations(
                clinicId: clinicId, status: statusFilter
            )
        } catch {
            print("❌ Consultation load error: \(error)")
            errorMessage = "Failed to load consultations: \(error.localizedDescription)"
        }
        isLoading = false
    }
}
