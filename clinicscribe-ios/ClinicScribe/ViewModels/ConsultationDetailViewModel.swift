import Foundation

@MainActor
final class ConsultationDetailViewModel: ObservableObject {
    @Published var consultation: Consultation?
    @Published var isLoading = true
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
}
