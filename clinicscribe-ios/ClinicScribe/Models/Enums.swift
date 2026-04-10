import Foundation

// Must match clinicscribe-app/src/lib/types.ts exactly

enum ConsultationStatus: String, Codable, CaseIterable {
    case scheduled
    case briefReady = "brief_ready"
    case recording
    case transcribing
    case generating
    case reviewPending = "review_pending"
    case approved
    case closeoutPending = "closeout_pending"
    case closed
    case exported

    var label: String {
        switch self {
        case .scheduled: return "Scheduled"
        case .briefReady: return "Brief Ready"
        case .recording: return "Recording"
        case .transcribing: return "Transcribing"
        case .generating: return "Generating Note"
        case .reviewPending: return "Pending Review"
        case .approved: return "Approved"
        case .closeoutPending: return "Closeout Pending"
        case .closed: return "Closed"
        case .exported: return "Exported"
        }
    }

    var shortLabel: String {
        switch self {
        case .scheduled: return "Sched"
        case .briefReady: return "Brief"
        case .recording: return "Rec"
        case .transcribing: return "Trans"
        case .generating: return "Gen"
        case .reviewPending: return "Review"
        case .approved: return "Done"
        case .closeoutPending: return "Tasks"
        case .closed: return "Closed"
        case .exported: return "Export"
        }
    }

    var badgeVariant: CSBadgeVariant {
        switch self {
        case .scheduled: return .default
        case .briefReady: return .info
        case .recording: return .error
        case .transcribing: return .warning
        case .generating: return .info
        case .reviewPending: return .warning
        case .approved: return .success
        case .closeoutPending: return .info
        case .closed: return .default
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

enum WorkflowStage: String, Codable, CaseIterable {
    case prepare = "Prepare"
    case capture = "Capture"
    case verify = "Verify"
    case tasks = "Tasks"
}

enum Sex: String, Codable, CaseIterable {
    case male
    case female
    case other

    var label: String { rawValue.capitalized }
}
