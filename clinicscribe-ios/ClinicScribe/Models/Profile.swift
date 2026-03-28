import Foundation

struct Profile: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    let clinicId: UUID
    var role: UserRole
    var firstName: String
    var lastName: String
    var specialty: String?
    var providerNumber: String?
    var avatarUrl: String?
    let createdAt: String
    var updatedAt: String

    var fullName: String { "\(firstName) \(lastName)" }
    var initials: String {
        let f = firstName.prefix(1)
        let l = lastName.prefix(1)
        return "\(f)\(l)"
    }

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case clinicId = "clinic_id"
        case role
        case firstName = "first_name"
        case lastName = "last_name"
        case specialty
        case providerNumber = "provider_number"
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
