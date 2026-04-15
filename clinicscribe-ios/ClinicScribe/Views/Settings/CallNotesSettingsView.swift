import Contacts
import ContactsUI
import SwiftUI
import UIKit

struct CallNotesSettingsView: View {
    @ObservedObject private var service = CallNotesService.shared
    @Environment(\.openURL) private var openURL

    @State private var showContactPicker = false
    @State private var isRequestingContacts = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                CallNotesHeroCard()

                if let errorMessage {
                    CallNotesInlineError(message: errorMessage)
                }

                SettingsSection(title: "Configuration") {
                    SettingsGroup {
                        CallNotesToggleRow(
                            icon: "phone.badge.waveform.fill",
                            tint: Theme.secondary,
                            title: "Enable call notes",
                            subtitle: "Gate the assisted native-call workflow behind explicit user settings and allowlisted contacts.",
                            isOn: Binding(
                                get: { service.settings.isEnabled },
                                set: { service.setEnabled($0) }
                            )
                        )

                        SettingsRowDivider()

                        CallNotesToggleRow(
                            icon: "checkmark.shield.fill",
                            tint: Theme.warning,
                            title: "Consent reminder",
                            subtitle: "Show a reminder to confirm the caller has agreed before any note capture or recap starts.",
                            isOn: Binding(
                                get: { service.settings.requireConsentPrompt },
                                set: { service.setRequireConsentPrompt($0) }
                            )
                        )
                    }
                }

                SettingsSection(title: "Capture Mode") {
                    SettingsGroup {
                        VStack(alignment: .leading, spacing: Theme.spacingMd) {
                            Text("Native Phone calls do not expose raw call audio to ClinicScribe. Choose the closest workflow you want the app to support.")
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)

                            Picker("Call note mode", selection: Binding(
                                get: { service.settings.captureMode },
                                set: { service.setCaptureMode($0) }
                            )) {
                                ForEach(CallNotesCaptureMode.allCases) { mode in
                                    Text(mode.title).tag(mode)
                                }
                            }
                            .pickerStyle(.segmented)

                            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                                ForEach(CallNotesCaptureMode.allCases) { mode in
                                    HStack(alignment: .top, spacing: Theme.spacingSm) {
                                        Circle()
                                            .fill(mode == service.settings.captureMode ? Theme.secondary : Theme.outlineVariant)
                                            .frame(width: 8, height: 8)
                                            .padding(.top, 6)
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(mode.title)
                                                .font(.subheadline.weight(.semibold))
                                                .foregroundStyle(Theme.onSurface)
                                            Text(mode.subtitle)
                                                .font(.caption)
                                                .foregroundStyle(Theme.onSurfaceVariant)
                                        }
                                    }
                                }
                            }
                        }
                        .padding(Theme.spacingMd)
                    }
                }

                SettingsSection(title: "Allowed Contacts") {
                    SettingsGroup {
                        Button {
                            handleAddContact()
                        } label: {
                            HStack(spacing: Theme.spacingMd) {
                                SettingsIcon(icon: "person.crop.circle.badge.plus", tint: Theme.primary)

                                VStack(alignment: .leading, spacing: 3) {
                                    Text("Add allowed contact")
                                        .font(.body)
                                        .foregroundStyle(Theme.onSurface)
                                    Text(contactButtonSubtitle)
                                        .font(.caption)
                                        .foregroundStyle(Theme.onSurfaceVariant)
                                }

                                Spacer(minLength: 0)

                                Text(service.contactsPermissionState.label)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                            }
                            .padding(.horizontal, Theme.spacingMd)
                            .padding(.vertical, Theme.spacingMd - 2)
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)

                        if !service.settings.allowedContacts.isEmpty {
                            SettingsRowDivider()

                            VStack(spacing: 0) {
                                ForEach(Array(service.settings.allowedContacts.enumerated()), id: \.element.id) { index, contact in
                                    AllowedContactRow(contact: contact) {
                                        service.removeAllowedContact(id: contact.id)
                                    }

                                    if index < service.settings.allowedContacts.count - 1 {
                                        SettingsRowDivider()
                                    }
                                }
                            }
                        }
                    }
                }

                SettingsSection(title: "Native Call Limits") {
                    SettingsGroup {
                        VStack(alignment: .leading, spacing: Theme.spacingSm) {
                            CallNotesBullet(text: "ClinicScribe can store selected contacts and prepare guided workflows for native calls.")
                            CallNotesBullet(text: "On iPhone, third-party apps do not receive the raw audio stream from the built-in Phone app.")
                            CallNotesBullet(text: "The safe implementation path here is assisted capture and post-call recap, not silent automatic recording of carrier calls.")
                        }
                        .padding(Theme.spacingMd)
                    }
                }

                Button {
                    guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
                    openURL(url)
                } label: {
                    HStack(spacing: Theme.spacingSm) {
                        Image(systemName: "gearshape.fill")
                            .font(.body.weight(.semibold))
                        Text("Open iPhone Settings")
                            .font(.body.weight(.semibold))
                    }
                    .foregroundStyle(Theme.primary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.spacingMd)
                    .background(Theme.surfaceContainerLowest)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
                    .overlay {
                        RoundedRectangle(cornerRadius: Theme.radiusMd)
                            .stroke(Theme.outlineVariant.opacity(0.35), lineWidth: 1)
                    }
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, Theme.spacingLg)
            .padding(.vertical, Theme.spacingMd)
        }
        .background(Theme.surface.ignoresSafeArea())
        .navigationTitle("Call Notes")
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showContactPicker) {
            CallNotesContactPicker { contact in
                if contact.phoneNumbers.isEmpty {
                    errorMessage = "That contact does not have a phone number to allowlist."
                    return
                }

                service.addAllowedContact(from: contact)
                errorMessage = nil
            }
        }
    }

    private var contactButtonSubtitle: String {
        switch service.contactsPermissionState {
        case .authorized, .limited:
            return service.settings.allowedContacts.isEmpty
                ? "Choose which contacts can use the assisted native-call note flow."
                : "\(service.settings.allowedContacts.count) contact\(service.settings.allowedContacts.count == 1 ? "" : "s") allowlisted."
        case .notDetermined:
            return "Grant Contacts access to choose which callers can use call notes."
        case .denied, .restricted, .unknown:
            return "Contacts access is required to manage the allowlist from your address book."
        }
    }

    private func handleAddContact() {
        errorMessage = nil

        switch service.contactsPermissionState {
        case .authorized, .limited:
            showContactPicker = true
        case .notDetermined:
            isRequestingContacts = true
            Task {
                let granted = await service.requestContactsAccess()
                isRequestingContacts = false
                if granted {
                    showContactPicker = true
                } else {
                    errorMessage = "Contacts access was not granted, so the allowlist could not be updated."
                }
            }
        case .denied, .restricted, .unknown:
            guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
            openURL(url)
        }
    }
}

private struct CallNotesHeroCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            HStack(alignment: .center, spacing: Theme.spacingMd) {
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.radiusMd)
                        .fill(Theme.secondaryFixed.opacity(0.28))
                        .frame(width: 58, height: 58)

                    Image(systemName: "phone.connection.fill")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(Theme.secondary)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Call Notes for Native Phone Calls")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Theme.onSurface)

                    Text("Allow selected contacts, keep consent explicit, and prepare assisted note capture without switching ClinicScribe into a VoIP product.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }

            VStack(alignment: .leading, spacing: Theme.spacingXS) {
                Text("Current limit")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.secondary)
                Text("iPhone does not expose the built-in Phone app’s raw call audio stream to ClinicScribe. This screen configures the compliant workflow around that limit.")
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
            }
        }
        .padding(Theme.spacingLg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Theme.surfaceContainerLowest, Theme.surfaceContainerLow],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusLg))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.radiusLg)
                .stroke(Theme.outlineVariant.opacity(0.45), lineWidth: 1)
        }
        .themeShadow(Theme.elevationLow)
    }
}

private struct CallNotesToggleRow: View {
    let icon: String
    let tint: Color
    let title: String
    let subtitle: String
    @Binding var isOn: Bool

    var body: some View {
        HStack(spacing: Theme.spacingMd) {
            SettingsIcon(icon: icon, tint: tint)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.body)
                    .foregroundStyle(Theme.onSurface)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(Theme.onSurfaceVariant)
                    .multilineTextAlignment(.leading)
            }

            Spacer(minLength: 0)

            Toggle("", isOn: $isOn)
                .labelsHidden()
        }
        .padding(.horizontal, Theme.spacingMd)
        .padding(.vertical, Theme.spacingMd - 2)
    }
}

private struct AllowedContactRow: View {
    let contact: CallNotesAllowedContact
    let onRemove: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: Theme.spacingMd) {
            SettingsIcon(icon: "person.text.rectangle.fill", tint: Theme.secondary)

            VStack(alignment: .leading, spacing: Theme.spacingXS) {
                Text(contact.displayName)
                    .font(.body)
                    .foregroundStyle(Theme.onSurface)

                ForEach(contact.phoneNumbers, id: \.self) { phoneNumber in
                    Text(phoneNumber)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }

            Spacer(minLength: 0)

            Button(role: .destructive, action: onRemove) {
                Image(systemName: "trash")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Theme.error)
                    .padding(Theme.spacingXS)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, Theme.spacingMd)
        .padding(.vertical, Theme.spacingMd - 2)
    }
}

private struct CallNotesInlineError: View {
    let message: String

    var body: some View {
        HStack(alignment: .top, spacing: Theme.spacingSm) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(Theme.error)
            Text(message)
                .font(.caption)
                .foregroundStyle(Theme.onSurface)
            Spacer(minLength: 0)
        }
        .padding(Theme.spacingMd)
        .background(Theme.errorContainer)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
    }
}

private struct CallNotesBullet: View {
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: Theme.spacingSm) {
            Circle()
                .fill(Theme.secondary)
                .frame(width: 7, height: 7)
                .padding(.top, 6)

            Text(text)
                .font(.subheadline)
                .foregroundStyle(Theme.onSurface)
        }
    }
}

private struct CallNotesContactPicker: UIViewControllerRepresentable {
    let onSelect: (CNContact) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onSelect: onSelect)
    }

    func makeUIViewController(context: Context) -> UINavigationController {
        let picker = CNContactPickerViewController()
        picker.delegate = context.coordinator
        picker.displayedPropertyKeys = [CNContactPhoneNumbersKey]
        picker.predicateForEnablingContact = NSPredicate(format: "phoneNumbers.@count > 0")
        return UINavigationController(rootViewController: picker)
    }

    func updateUIViewController(_ uiViewController: UINavigationController, context: Context) {}

    final class Coordinator: NSObject, CNContactPickerDelegate {
        let onSelect: (CNContact) -> Void

        init(onSelect: @escaping (CNContact) -> Void) {
            self.onSelect = onSelect
        }

        func contactPicker(_ picker: CNContactPickerViewController, didSelect contact: CNContact) {
            onSelect(contact)
        }
    }
}
