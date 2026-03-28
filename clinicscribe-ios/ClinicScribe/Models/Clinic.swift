import Foundation

struct Clinic: Codable, Identifiable {
    let id: UUID
    var name: String
    var address: String
    var phone: String
    var email: String
    var subscriptionTier: SubscriptionTier
    var stripeCustomerId: String?
    var stripeSubscriptionId: String?
    var stripeSubscriptionStatus: String
    var subscriptionSeats: Int
    var subscriptionPeriodEnd: String?
    var trialEndsAt: String?
    let createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, address, phone, email
        case subscriptionTier = "subscription_tier"
        case stripeCustomerId = "stripe_customer_id"
        case stripeSubscriptionId = "stripe_subscription_id"
        case stripeSubscriptionStatus = "stripe_subscription_status"
        case subscriptionSeats = "subscription_seats"
        case subscriptionPeriodEnd = "subscription_period_end"
        case trialEndsAt = "trial_ends_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
