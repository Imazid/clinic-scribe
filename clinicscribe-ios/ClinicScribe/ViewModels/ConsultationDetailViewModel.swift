import Foundation

@MainActor
final class ConsultationDetailViewModel: ObservableObject {
    @Published var consultation: Consultation?
    @Published var isLoading = true
    @Published var isDeleting = false
    @Published var errorMessage: String?

    func load(id: UUID) async {
        isLoading = true
        errorMessage = nil
        do {
            consultation = try await ConsultationService.shared.getConsultation(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func deleteConsultation(id: UUID) async -> Bool {
        guard !isDeleting else { return false }
        isDeleting = true
        errorMessage = nil

        do {
            try await ConsultationService.shared.deleteConsultation(id: id)
            consultation = nil
            isDeleting = false
            return true
        } catch {
            errorMessage = error.localizedDescription
            isDeleting = false
            return false
        }
    }
}
