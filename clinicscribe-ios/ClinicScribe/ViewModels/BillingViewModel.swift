import Foundation

@MainActor
final class BillingViewModel: ObservableObject {
    @Published var selectedPlan = "solo"
    @Published var seats = 1
    @Published var isLoading = false
    @Published var errorMessage: String?

    func openCheckout() async -> URL? {
        isLoading = true
        errorMessage = nil
        do {
            let url = try await BillingService.shared.getCheckoutURL(plan: selectedPlan, seats: seats)
            isLoading = false
            return url
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return nil
        }
    }

    func openPortal() async -> URL? {
        isLoading = true
        do {
            let url = try await BillingService.shared.getPortalURL()
            isLoading = false
            return url
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return nil
        }
    }
}
