import Foundation
import Supabase

private struct ClinicTemplateRow: Decodable {
    let key: String
    let clinicId: String?
    let name: String
    let format: NoteFormat
    let category: String
    let outputKind: String
    let specialty: String?
    let description: String?
    let promptInstructions: String?
    let systemPromptOverride: String?
    let sections: [String]
    let tags: [String]
    let isDefault: Bool
    let isSystem: Bool
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case key, name, format, category, specialty, sections, tags
        case clinicId = "clinic_id"
        case outputKind = "output_kind"
        case description
        case promptInstructions = "prompt_instructions"
        case systemPromptOverride = "system_prompt_override"
        case isDefault = "is_default"
        case isSystem = "is_system"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

@MainActor
final class TemplateLibraryService {
    static let shared = TemplateLibraryService()

    private var supabase: SupabaseClient { SupabaseManager.shared.client }

    private init() {}

    func loadTemplates(clinicId: UUID?) async throws -> [NoteTemplate] {
        guard let clinicId else {
            return NoteTemplateCatalog.allTemplates
        }

        let rows: [ClinicTemplateRow] = try await supabase.from("note_templates")
            .select("key, clinic_id, name, format, category, output_kind, specialty, description, prompt_instructions, system_prompt_override, sections, tags, is_default, is_system, created_at, updated_at")
            .eq("clinic_id", value: clinicId.uuidString)
            .order("is_default", ascending: false)
            .order("name", ascending: true)
            .execute()
            .value

        let clinicTemplates = rows.map(mapTemplateRow(_:))
        return mergeTemplates(system: NoteTemplateCatalog.allTemplates, clinic: clinicTemplates)
    }

    func resolveTemplate(key: String?, clinicId: UUID?) async -> NoteTemplate? {
        guard let key else { return nil }
        let templates = (try? await loadTemplates(clinicId: clinicId)) ?? NoteTemplateCatalog.allTemplates
        return NoteTemplateCatalog.template(withId: key, in: templates)
    }

    private func mergeTemplates(system: [NoteTemplate], clinic: [NoteTemplate]) -> [NoteTemplate] {
        var mergedById = Dictionary(uniqueKeysWithValues: system.map { ($0.id, $0) })
        clinic.forEach { mergedById[$0.id] = $0 }

        return mergedById.values.sorted { lhs, rhs in
            if lhs.isDefault != rhs.isDefault {
                return lhs.isDefault && !rhs.isDefault
            }
            if lhs.isBuiltIn != rhs.isBuiltIn {
                return !lhs.isBuiltIn && rhs.isBuiltIn
            }
            return lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
        }
    }

    private func mapTemplateRow(_ row: ClinicTemplateRow) -> NoteTemplate {
        NoteTemplate(
            id: row.key,
            clinicId: row.clinicId,
            name: row.name,
            kind: kind(for: row.category, outputKind: row.outputKind),
            preferredFormat: row.format,
            specialty: row.specialty,
            description: row.description ?? row.promptInstructions ?? "",
            systemPromptOverride: row.systemPromptOverride,
            sections: row.sections,
            keywords: row.tags,
            isDefault: row.isDefault,
            isBuiltIn: row.isSystem,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        )
    }

    private func kind(for category: String, outputKind: String) -> NoteTemplateKind {
        switch outputKind {
        case "meeting":
            return .meeting
        case "certificate", "form":
            return .form
        case "patient_summary":
            return .patientEducation
        case "goals":
            return .planning
        default:
            break
        }

        switch category {
        case "clinic_letter", "referral_letter":
            return .letter
        case "patient_communication":
            return .patientEducation
        case "meeting_note":
            return .meeting
        case "certificate", "form":
            return .form
        case "care_planning":
            return .planning
        default:
            return .clinicalNote
        }
    }
}
