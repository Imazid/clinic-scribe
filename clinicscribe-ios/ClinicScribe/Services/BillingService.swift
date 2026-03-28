import Foundation

struct CheckoutResponse: Decodable {
    let sessionUrl: String
}

struct PortalResponse: Decodable {
    let portalUrl: String
}

@MainActor
final class BillingService {
    static let shared = BillingService()
    private init() {}

    func getCheckoutURL(plan: String, seats: Int) async throws -> URL {
        struct Body: Encodable {
            let plan: String
            let seats: Int
        }

        let response: CheckoutResponse = try await APIClient.shared.request(
            method: "POST",
            path: "/api/stripe/create-checkout",
            body: Body(plan: plan, seats: seats)
        )

        guard let url = URL(string: response.sessionUrl) else {
            throw APIError.badRequest("Invalid checkout URL")
        }
        return url
    }

    func getPortalURL() async throws -> URL {
        let response: PortalResponse = try await APIClient.shared.request(
            method: "POST",
            path: "/api/stripe/portal"
        )

        guard let url = URL(string: response.portalUrl) else {
            throw APIError.badRequest("Invalid portal URL")
        }
        return url
    }
}
