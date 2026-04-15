import Contacts
import Foundation

@MainActor
final class CallNotesService: ObservableObject {
    static let shared = CallNotesService()

    @Published private(set) var settings: CallNotesSettings

    private let userDefaults: UserDefaults
    private let contactStore = CNContactStore()
    private let storageKey = "ClinicScribe.CallNotesSettings.v1"

    private init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults

        if let data = userDefaults.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode(CallNotesSettings.self, from: data) {
            settings = decoded
        } else {
            settings = CallNotesSettings()
        }
    }

    var contactsPermissionState: ContactsPermissionState {
        let status = CNContactStore.authorizationStatus(for: .contacts)
        switch status {
        case .notDetermined:
            return .notDetermined
        case .restricted:
            return .restricted
        case .denied:
            return .denied
        case .authorized:
            return .authorized
        case .limited:
            return .limited
        @unknown default:
            return .unknown
        }
    }

    func requestContactsAccess() async -> Bool {
        await withCheckedContinuation { continuation in
            contactStore.requestAccess(for: .contacts) { granted, _ in
                continuation.resume(returning: granted)
            }
        }
    }

    func setEnabled(_ value: Bool) {
        settings.isEnabled = value
        persist()
    }

    func setRequireConsentPrompt(_ value: Bool) {
        settings.requireConsentPrompt = value
        persist()
    }

    func setCaptureMode(_ mode: CallNotesCaptureMode) {
        settings.captureMode = mode
        persist()
    }

    func addAllowedContact(from contact: CNContact) {
        let normalizedNumbers = normalizedPhoneNumbers(from: contact)
        guard !normalizedNumbers.isEmpty else { return }

        let displayName =
            CNContactFormatter.string(from: contact, style: .fullName)?
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .nonEmptyValue
            ?? "Unnamed Contact"

        let contactId = contact.identifier.nonEmptyValue ?? UUID().uuidString
        let newRecord = CallNotesAllowedContact(
            id: contactId,
            contactIdentifier: contact.identifier.nonEmptyValue,
            displayName: displayName,
            phoneNumbers: normalizedNumbers,
            addedAt: Date()
        )

        if let index = settings.allowedContacts.firstIndex(where: {
            $0.contactIdentifier == newRecord.contactIdentifier || Set($0.phoneNumbers).intersection(newRecord.phoneNumbers).isEmpty == false
        }) {
            settings.allowedContacts[index].displayName = newRecord.displayName
            settings.allowedContacts[index].contactIdentifier = newRecord.contactIdentifier
            settings.allowedContacts[index].phoneNumbers = Array(Set(settings.allowedContacts[index].phoneNumbers + newRecord.phoneNumbers)).sorted()
        } else {
            settings.allowedContacts.append(newRecord)
        }

        settings.allowedContacts.sort { $0.displayName.localizedCaseInsensitiveCompare($1.displayName) == .orderedAscending }
        persist()
    }

    func removeAllowedContact(id: String) {
        settings.allowedContacts.removeAll { $0.id == id }
        persist()
    }

    func isAllowed(phoneNumber: String) -> Bool {
        let normalized = Self.normalize(phoneNumber)
        guard !normalized.isEmpty else { return false }
        return settings.allowedContacts.contains { $0.phoneNumbers.contains(normalized) }
    }

    private func normalizedPhoneNumbers(from contact: CNContact) -> [String] {
        Array(
            Set(
                contact.phoneNumbers
                    .map { Self.normalize($0.value.stringValue) }
                    .filter { !$0.isEmpty }
            )
        )
        .sorted()
    }

    private func persist() {
        if let encoded = try? JSONEncoder().encode(settings) {
            userDefaults.set(encoded, forKey: storageKey)
        }
    }

    static func normalize(_ phoneNumber: String) -> String {
        let scalars = phoneNumber.unicodeScalars.filter {
            CharacterSet.decimalDigits.contains($0) || $0 == "+"
        }
        let result = String(String.UnicodeScalarView(scalars))
        if result.hasPrefix("00") {
            return "+" + result.dropFirst(2)
        }
        return result
    }
}

private extension String {
    var nonEmptyValue: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
