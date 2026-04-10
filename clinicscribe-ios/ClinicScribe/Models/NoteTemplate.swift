import Foundation

enum NoteTemplateKind: String, Codable, CaseIterable {
    case clinicalNote = "clinical_note"
    case letter = "letter"
    case meeting = "meeting"
    case form = "form"
    case patientEducation = "patient_education"
    case planning = "planning"
}

struct NoteTemplate: Codable, Identifiable, Hashable {
    let id: String
    let clinicId: String?
    var name: String
    var kind: NoteTemplateKind
    var preferredFormat: NoteFormat
    var specialty: String?
    var description: String
    var systemPromptOverride: String?
    var sections: [String]
    var keywords: [String]
    var isDefault: Bool
    var isBuiltIn: Bool
    let createdAt: String
    var updatedAt: String

    init(
        id: String,
        clinicId: String? = nil,
        name: String,
        kind: NoteTemplateKind,
        preferredFormat: NoteFormat,
        specialty: String? = nil,
        description: String,
        systemPromptOverride: String? = nil,
        sections: [String],
        keywords: [String] = [],
        isDefault: Bool = false,
        isBuiltIn: Bool = true,
        createdAt: String = "",
        updatedAt: String = ""
    ) {
        self.id = id
        self.clinicId = clinicId
        self.name = name
        self.kind = kind
        self.preferredFormat = preferredFormat
        self.specialty = specialty
        self.description = description
        self.systemPromptOverride = systemPromptOverride
        self.sections = sections
        self.keywords = keywords
        self.isDefault = isDefault
        self.isBuiltIn = isBuiltIn
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    enum CodingKeys: String, CodingKey {
        case id
        case clinicId = "clinic_id"
        case name
        case kind
        case preferredFormat = "preferred_format"
        case legacyFormat = "format"
        case specialty
        case description
        case systemPromptOverride = "system_prompt_override"
        case sections
        case keywords
        case isDefault = "is_default"
        case isBuiltIn = "is_built_in"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        clinicId = try container.decodeIfPresent(String.self, forKey: .clinicId)
        name = try container.decode(String.self, forKey: .name)
        kind = try container.decodeIfPresent(NoteTemplateKind.self, forKey: .kind) ?? .clinicalNote
        preferredFormat = try container.decodeIfPresent(NoteFormat.self, forKey: .preferredFormat)
            ?? container.decodeIfPresent(NoteFormat.self, forKey: .legacyFormat)
            ?? .soap
        specialty = try container.decodeIfPresent(String.self, forKey: .specialty)
        description = try container.decodeIfPresent(String.self, forKey: .description) ?? ""
        systemPromptOverride = try container.decodeIfPresent(String.self, forKey: .systemPromptOverride)
        sections = try container.decodeIfPresent([String].self, forKey: .sections) ?? []
        keywords = try container.decodeIfPresent([String].self, forKey: .keywords) ?? []
        isDefault = try container.decodeIfPresent(Bool.self, forKey: .isDefault) ?? false
        isBuiltIn = try container.decodeIfPresent(Bool.self, forKey: .isBuiltIn) ?? false
        createdAt = try container.decodeIfPresent(String.self, forKey: .createdAt) ?? ""
        updatedAt = try container.decodeIfPresent(String.self, forKey: .updatedAt) ?? ""
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(clinicId, forKey: .clinicId)
        try container.encode(name, forKey: .name)
        try container.encode(kind, forKey: .kind)
        try container.encode(preferredFormat, forKey: .preferredFormat)
        try container.encodeIfPresent(specialty, forKey: .specialty)
        try container.encode(description, forKey: .description)
        try container.encodeIfPresent(systemPromptOverride, forKey: .systemPromptOverride)
        try container.encode(sections, forKey: .sections)
        try container.encode(keywords, forKey: .keywords)
        try container.encode(isDefault, forKey: .isDefault)
        try container.encode(isBuiltIn, forKey: .isBuiltIn)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(updatedAt, forKey: .updatedAt)
    }

    var displaySubtitle: String {
        if let specialty, !specialty.isEmpty {
            return specialty
        }
        return kind.rawValue.replacingOccurrences(of: "_", with: " ").capitalized
    }

    var searchText: String {
        let components: [String?] = [
            name,
            specialty,
            description,
            keywords.isEmpty ? nil : keywords.joined(separator: " "),
            sections.isEmpty ? nil : sections.joined(separator: " ")
        ]

        return components
            .compactMap { $0 }
            .joined(separator: " ")
            .lowercased()
    }
}

struct NoteTemplateSelectionPayload: Codable, Hashable {
    let id: String
    let name: String
    let kind: NoteTemplateKind
    let preferredFormat: NoteFormat
    let specialty: String?
    let description: String
    let sections: [String]
    let keywords: [String]

    init(template: NoteTemplate) {
        id = template.id
        name = template.name
        kind = template.kind
        preferredFormat = template.preferredFormat
        specialty = template.specialty
        description = template.description
        sections = template.sections
        keywords = template.keywords
    }
}
