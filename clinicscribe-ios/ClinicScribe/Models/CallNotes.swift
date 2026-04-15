import Foundation

enum CallNotesCaptureMode: String, Codable, CaseIterable, Identifiable {
    case postCallRecap = "post_call_recap"
    case assistedNativeCall = "assisted_native_call"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .postCallRecap:
            return "Post-call recap"
        case .assistedNativeCall:
            return "Assisted native call"
        }
    }

    var subtitle: String {
        switch self {
        case .postCallRecap:
            return "Create a structured recap immediately after the call and route it into verification."
        case .assistedNativeCall:
            return "Prepare selected contacts for a guided native-call workflow, but do not expect raw Phone app audio capture."
        }
    }
}

enum ContactsPermissionState: String {
    case notDetermined
    case denied
    case restricted
    case authorized
    case limited
    case unknown

    var label: String {
        switch self {
        case .notDetermined:
            return "Not set"
        case .denied:
            return "Denied"
        case .restricted:
            return "Restricted"
        case .authorized:
            return "Allowed"
        case .limited:
            return "Limited"
        case .unknown:
            return "Unknown"
        }
    }
}

struct CallNotesAllowedContact: Codable, Identifiable, Equatable {
    let id: String
    var contactIdentifier: String?
    var displayName: String
    var phoneNumbers: [String]
    var addedAt: Date
}

struct CallNotesSettings: Codable {
    var isEnabled: Bool = false
    var requireConsentPrompt: Bool = true
    var captureMode: CallNotesCaptureMode = .postCallRecap
    var allowedContacts: [CallNotesAllowedContact] = []
}
