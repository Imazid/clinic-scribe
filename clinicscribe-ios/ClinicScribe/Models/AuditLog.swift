import Foundation

struct AuditLog: Codable, Identifiable {
    let id: UUID
    let clinicId: UUID
    let userId: UUID
    let action: String
    let entityType: String
    let entityId: String
    let details: [String: AnyCodable]?
    let ipAddress: String?
    let createdAt: String
    var user: Profile?

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case userId = "user_id"
        case action
        case entityType = "entity_type"
        case entityId = "entity_id"
        case details
        case ipAddress = "ip_address"
        case createdAt = "created_at"
        case user
    }
}

// Lightweight wrapper to encode/decode arbitrary JSON values
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) { self.value = value }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() { value = NSNull() }
        else if let s = try? container.decode(String.self) { value = s }
        else if let i = try? container.decode(Int.self) { value = i }
        else if let d = try? container.decode(Double.self) { value = d }
        else if let b = try? container.decode(Bool.self) { value = b }
        else if let array = try? container.decode([AnyCodable].self) { value = array.map(\.value) }
        else if let dict = try? container.decode([String: AnyCodable].self) { value = dict.mapValues(\.value) }
        else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unsupported JSON value")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if value is NSNull {
            try container.encodeNil()
        } else if let s = value as? String {
            try container.encode(s)
        } else if let i = value as? Int {
            try container.encode(i)
        } else if let d = value as? Double {
            try container.encode(d)
        } else if let b = value as? Bool {
            try container.encode(b)
        } else if let array = value as? [Any] {
            try container.encode(array.map(AnyCodable.init))
        } else if let dict = value as? [String: Any] {
            try container.encode(dict.mapValues(AnyCodable.init))
        } else if let array = value as? [AnyCodable] {
            try container.encode(array)
        } else if let dict = value as? [String: AnyCodable] {
            try container.encode(dict)
        } else {
            try container.encode(String(describing: value))
        }
    }
}
