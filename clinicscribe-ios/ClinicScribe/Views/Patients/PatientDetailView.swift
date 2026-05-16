import SwiftUI

/// `PatientDetailView` — pixel-faithful to the design package's combined
/// timeline + sectioned profile pattern. Hero strip at top with key stats,
/// then a two-tab switcher: Timeline (default) | Sections. Same data wiring
/// (`PatientDetailViewModel`) — visual only.
struct PatientDetailView: View {
    let patientId: UUID

    @StateObject private var vm = PatientDetailViewModel()
    @ObservedObject private var auth = AuthService.shared
    @State private var activeTab: ProfileTab = .timeline

    private enum ProfileTab: String, CaseIterable, Identifiable {
        case timeline, sections
        var id: String { rawValue }
        var label: String {
            switch self {
            case .timeline: return "Timeline"
            case .sections: return "Sections"
            }
        }
        var systemImage: String {
            switch self {
            case .timeline: return "clock.arrow.circlepath"
            case .sections: return "rectangle.split.2x2"
            }
        }
    }

    var body: some View {
        ScrollView {
            if let patient = vm.patient {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    hero(patient: patient)

                    quickActions(patient: patient)

                    tabSwitcher

                    Group {
                        switch activeTab {
                        case .timeline: PatientTimelineView(consultations: vm.consultations)
                        case .sections: sectionsTab(patient: patient)
                        }
                    }
                }
                .padding(Theme.spacingMd)
            } else if vm.isLoading {
                ProgressView("Loading patient…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, 120)
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
                .frame(maxWidth: .infinity)
                .padding(.top, 120)
            }
        }
        .background(Theme.surface)
        .navigationTitle("Patient")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load(patientId: patientId) }
    }

    // MARK: - Hero

    private func hero(patient: Patient) -> some View {
        let visitCount = vm.consultations.count
        let lastVisit = vm.consultations.first.map { DateFormatters.formatISO($0.startedAt) } ?? "—"
        let stats: [CSStat] = [
            CSStat(label: "Visits", value: "\(visitCount)",
                   sub: visitCount == 0 ? "First time" : "On file",
                   systemImage: "stethoscope",
                   tone: visitCount == 0 ? .default : .info),
            CSStat(label: "Last visit", value: lastVisit,
                   sub: visitCount == 0 ? "—" : "Most recent",
                   systemImage: "clock"),
            CSStat(label: "Allergies", value: "\(patient.allergies.count)",
                   sub: patient.allergies.isEmpty ? "None recorded" : "Flagged",
                   systemImage: "exclamationmark.triangle",
                   tone: patient.allergies.isEmpty ? .default : .error),
            CSStat(label: "Conditions", value: "\(patient.conditions.count)",
                   sub: patient.conditions.isEmpty ? "None recorded" : "Active",
                   systemImage: "heart.text.square",
                   tone: patient.conditions.isEmpty ? .default : .info),
        ]

        return CSHeroStrip(
            eyebrow: "PATIENT",
            title: {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("Care for")
                    CSHeroAccent("\(patient.firstName).")
                }
            },
            description: profileDescription(patient: patient),
            stats: stats
        )
    }

    private func profileDescription(patient: Patient) -> String {
        var parts: [String] = []
        if let age = age(from: patient.dateOfBirth) { parts.append("\(age) yrs") }
        parts.append(patient.sex.label)
        if let mrn = patient.mrn { parts.append("MRN \(mrn)") }
        return parts.joined(separator: " · ")
    }

    private func age(from dob: String) -> Int? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        guard let date = formatter.date(from: dob) else { return nil }
        let comps = Calendar.current.dateComponents([.year], from: date, to: Date())
        return comps.year
    }

    // MARK: - Quick actions row

    private func quickActions(patient: Patient) -> some View {
        HStack(spacing: 8) {
            NavigationLink {
                NewConsultationView(clinicId: auth.clinicId, clinicianId: auth.profileId)
            } label: {
                actionChip(icon: "mic.fill", label: "Start consultation", filled: true)
            }
            .buttonStyle(.plain)

            NavigationLink {
                PatientFormView(clinicId: auth.clinicId, editPatient: patient)
            } label: {
                actionChip(icon: "pencil", label: "Edit", filled: false)
            }
            .buttonStyle(.plain)

            CSBadge(text: patient.consentStatus.label, variant: patient.consentStatus.badgeVariant)
        }
    }

    private func actionChip(icon: String, label: String, filled: Bool) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .bold))
            Text(label)
                .font(.system(size: 13, weight: .semibold))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
        .foregroundStyle(filled ? Theme.onPrimary : Theme.onSurface)
        .background(filled ? Theme.primary : Theme.surfaceContainerLowest)
        .overlay(
            RoundedRectangle(cornerRadius: 11)
                .strokeBorder(filled ? Color.clear : Theme.outlineVariant, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 11))
    }

    // MARK: - Tab switcher

    private var tabSwitcher: some View {
        HStack(spacing: 4) {
            ForEach(ProfileTab.allCases) { tab in
                Button {
                    withAnimation(.spring(response: 0.3)) { activeTab = tab }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: tab.systemImage)
                            .font(.system(size: 11, weight: .bold))
                        Text(tab.label)
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 9)
                    .foregroundStyle(activeTab == tab ? Theme.onPrimary : Theme.onSurfaceVariant)
                    .background(activeTab == tab ? Theme.primary : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(Theme.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusMd)
                .strokeBorder(Theme.outlineVariant, lineWidth: 1)
        )
    }

    // MARK: - Sections tab

    private func sectionsTab(patient: Patient) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingMd) {
            // Contact
            sectionCard(title: "Contact", icon: "person.crop.circle") {
                if let phone = patient.phone { InfoRow(icon: "phone", text: phone) }
                if let email = patient.email { InfoRow(icon: "envelope", text: email) }
                InfoRow(icon: "calendar", text: patient.dateOfBirth)
                if patient.phone == nil && patient.email == nil {
                    Text("No phone or email on file.")
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                }
            }

            // Identifiers
            if patient.mrn != nil || patient.medicareNumber != nil || patient.ihi != nil {
                sectionCard(title: "Identifiers", icon: "number") {
                    if let mrn = patient.mrn { InfoRow(icon: "number", text: "MRN: \(mrn)") }
                    if let mc = patient.medicareNumber { InfoRow(icon: "creditcard", text: "Medicare: \(mc)") }
                    if let ihi = patient.ihi { InfoRow(icon: "shield", text: "IHI: \(ihi)") }
                }
            }

            // Allergies
            if !patient.allergies.isEmpty {
                sectionCard(title: "Allergies", icon: "exclamationmark.triangle.fill", tint: Theme.error) {
                    chipFlow(items: patient.allergies, variant: .error)
                }
            }

            // Conditions
            if !patient.conditions.isEmpty {
                sectionCard(title: "Active conditions", icon: "heart.text.square", tint: Theme.secondary) {
                    chipFlow(items: patient.conditions, variant: .info)
                }
            }

            // Notes
            if let notes = patient.notes, !notes.isEmpty {
                sectionCard(title: "Notes", icon: "note.text") {
                    Text(notes)
                        .font(.subheadline)
                        .foregroundStyle(Theme.onSurface)
                }
            }

            // Consent
            sectionCard(title: "Consent", icon: "checkmark.shield") {
                HStack(spacing: 8) {
                    CSBadge(text: patient.consentStatus.label, variant: patient.consentStatus.badgeVariant)
                    if let date = patient.consentDate {
                        Text("Recorded \(date)")
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    } else {
                        Text("No consent date on file")
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }
                }
            }
        }
    }

    private func sectionCard<Content: View>(
        title: String,
        icon: String,
        tint: Color = Theme.secondary,
        @ViewBuilder content: () -> Content
    ) -> some View {
        SectionCard(title: title, icon: icon, tint: tint, content: content())
    }

    private func chipFlow(items: [String], variant: CSBadgeVariant) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(items, id: \.self) { item in
                    CSBadge(text: item, variant: variant)
                }
            }
        }
    }
}

private struct SectionCard<Content: View>: View {
    let title: String
    let icon: String
    let tint: Color
    let content: Content

    var body: some View {
        CSCard {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                HStack(spacing: 8) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(tint.opacity(0.10))
                            .frame(width: 26, height: 26)
                        Image(systemName: icon)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(tint)
                    }
                    Text(title.uppercased())
                        .font(.system(size: 11, weight: .bold))
                        .tracking(0.6)
                        .foregroundStyle(Theme.outline)
                }
                content
            }
        }
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
