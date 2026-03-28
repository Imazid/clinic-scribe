import SwiftUI

struct PatientDetailView: View {
    let patientId: UUID
    @StateObject private var vm = PatientDetailViewModel()

    var body: some View {
        ScrollView {
            if let patient = vm.patient {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    // Header
                    HStack(spacing: Theme.spacingMd) {
                        CSAvatar(initials: patient.initials, size: 56)
                        VStack(alignment: .leading, spacing: Theme.spacingXS) {
                            Text(patient.fullName)
                                .font(.title2.weight(.bold))
                                .foregroundStyle(Theme.primary)
                            CSBadge(text: patient.consentStatus.label, variant: patient.consentStatus.badgeVariant)
                        }
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("\(patient.fullName), consent status: \(patient.consentStatus.label)")

                    // Contact
                    CSCard {
                        VStack(alignment: .leading, spacing: Theme.spacingSm) {
                            Text("Contact").font(.subheadline.weight(.semibold)).foregroundStyle(Theme.onSurfaceVariant)
                            if let phone = patient.phone { InfoRow(icon: "phone", text: phone) }
                            if let email = patient.email { InfoRow(icon: "envelope", text: email) }
                            InfoRow(icon: "calendar", text: patient.dateOfBirth)
                        }
                    }

                    // Medical IDs
                    if patient.mrn != nil || patient.medicareNumber != nil {
                        CSCard {
                            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                                Text("Medical IDs").font(.subheadline.weight(.semibold)).foregroundStyle(Theme.onSurfaceVariant)
                                if let mrn = patient.mrn { InfoRow(icon: "number", text: "MRN: \(mrn)") }
                                if let mc = patient.medicareNumber { InfoRow(icon: "creditcard", text: "Medicare: \(mc)") }
                                if let ihi = patient.ihi { InfoRow(icon: "shield", text: "IHI: \(ihi)") }
                            }
                        }
                    }

                    // Allergies & Conditions
                    if !patient.allergies.isEmpty || !patient.conditions.isEmpty {
                        CSCard {
                            VStack(alignment: .leading, spacing: Theme.spacingSm + Theme.spacingXS) {
                                if !patient.allergies.isEmpty {
                                    Text("Allergies").font(.subheadline.weight(.semibold)).foregroundStyle(Theme.onSurfaceVariant)
                                    FlowLayout(items: patient.allergies) { allergy in
                                        CSBadge(text: allergy, variant: .error)
                                    }
                                }
                                if !patient.conditions.isEmpty {
                                    Text("Conditions").font(.subheadline.weight(.semibold)).foregroundStyle(Theme.onSurfaceVariant)
                                    FlowLayout(items: patient.conditions) { condition in
                                        CSBadge(text: condition, variant: .info)
                                    }
                                }
                            }
                        }
                    }

                    // Consultation Timeline
                    PatientTimelineView(consultations: vm.consultations)
                }
                .padding(Theme.spacingMd)
            } else if vm.isLoading {
                ProgressView("Loading patient...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                VStack(spacing: Theme.spacingSm) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundStyle(Theme.warning)
                        .accessibilityLabel("Error loading patient")
                    Text("Unable to load patient details")
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(Theme.surface)
        .navigationTitle("Patient")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load(patientId: patientId) }
    }
}

struct InfoRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: Theme.spacingSm) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(Theme.onSurfaceVariant)
                .frame(width: Theme.spacingLg)
                .accessibilityLabel(accessibilityLabelForIcon)
            Text(text).font(.subheadline).foregroundStyle(Theme.onSurface)
        }
        .accessibilityElement(children: .combine)
    }

    private var accessibilityLabelForIcon: String {
        switch icon {
        case "phone": return "Phone"
        case "envelope": return "Email"
        case "calendar": return "Date of birth"
        case "number": return "Medical record number"
        case "creditcard": return "Medicare"
        case "shield": return "Healthcare identifier"
        default: return icon
        }
    }
}

struct FlowLayout<Item: Hashable, Content: View>: View {
    let items: [Item]
    let content: (Item) -> Content

    var body: some View {
        HStack(spacing: Theme.spacingXS + 2) {
            ForEach(items, id: \.self) { item in
                content(item)
            }
        }
    }
}
