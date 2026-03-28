import Foundation

struct Patient: Codable, Identifiable {
    let id: UUID
    let clinicId: UUID
    var firstName: String
    var lastName: String
    var dateOfBirth: String
    var sex: Sex
    var email: String?
    var phone: String?
    var mrn: String?
    var medicareNumber: String?
    var ihi: String?
    var allergies: [String]
    var conditions: [String]
    var consentStatus: ConsentStatus
    var consentDate: String?
    var notes: String?
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
        case clinicId = "clinic_id"
        case firstName = "first_name"
        case lastName = "last_name"
        case dateOfBirth = "date_of_birth"
        case sex, email, phone, mrn
        case medicareNumber = "medicare_number"
        case ihi, allergies, conditions
        case consentStatus = "consent_status"
        case consentDate = "consent_date"
        case notes
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
