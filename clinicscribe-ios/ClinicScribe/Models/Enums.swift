import Foundation

// Must match clinicscribe-app/src/lib/types.ts exactly

enum ConsultationStatus: String, Codable, CaseIterable {
    case recording
    case transcribing
    case generating
    case reviewPending = "review_pending"
    case approved
    case exported

    var label: String {
        switch self {
        case .recording: return "Recording"
        case .transcribing: return "Transcribing"
        case .generating: return "Generating Note"
        case .reviewPending: return "Pending Review"
        case .approved: return "Approved"
        case .exported: return "Exported"
        }
    }

    var shortLabel: String {
        switch self {
        case .recording: return "Rec"
        case .transcribing: return "Trans"
        case .generating: return "Gen"
        case .reviewPending: return "Review"
        case .approved: return "Done"
        case .exported: return "Export"
        }
    }

    var badgeVariant: CSBadgeVariant {
        switch self {
        case .recording: return .error
        case .transcribing: return .warning
        case .generating: return .info
        case .reviewPending: return .warning
        case .approved: return .success
        case .exported: return .default
        }
    }
}

enum UserRole: String, Codable {
    case admin
    case clinician
    case receptionist
}

enum SubscriptionTier: String, Codable {
    case solo
    case clinic
    case group
    case enterprise
}

enum ConsentStatus: String, Codable, CaseIterable {
    case granted
    case revoked
    case pending

    var label: String {
        switch self {
        case .granted: return "Consent Granted"
        case .revoked: return "Consent Revoked"
        case .pending: return "Consent Pending"
        }
    }

    var badgeVariant: CSBadgeVariant {
        switch self {
        case .granted: return .success
        case .revoked: return .error
        case .pending: return .warning
        }
    }
}

enum NoteFormat: String, Codable {
    case soap
    case progress
    case visitSummary = "visit_summary"
}

enum ExportFormat: String, Codable {
    case pdf
    case clipboard
}

enum IntegrationStatus: String, Codable {
    case connected
    case disconnected
    case syncing
    case error
}

enum Sex: String, Codable, CaseIterable {
    case male
    case female
    case other

    var label: String { rawValue.capitalized }
}
