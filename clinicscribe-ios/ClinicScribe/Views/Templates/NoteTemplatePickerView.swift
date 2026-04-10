import SwiftUI

struct NoteTemplateSelectionCard: View {
    let title: String
    let template: NoteTemplate
    let helperText: String
    let actionTitle: String
    let onAction: () -> Void

    var body: some View {
        CSCard(variant: .outlined) {
            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(title)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.onSurfaceVariant)

                        Text(template.name)
                            .font(.body.weight(.semibold))
                            .foregroundStyle(Theme.onSurface)

                        Text(helperText)
                            .font(.caption)
                            .foregroundStyle(Theme.onSurfaceVariant)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 6) {
                        CSBadge(text: template.kind.rawValue.replacingOccurrences(of: "_", with: " ").capitalized, variant: .info)
                        CSBadge(text: template.preferredFormat.rawValue.replacingOccurrences(of: "_", with: " ").capitalized)
                    }
                }

                HStack(spacing: Theme.spacingSm) {
                    if let specialty = template.specialty, !specialty.isEmpty {
                        CSBadge(text: specialty)
                    }
                    Text(template.sections.prefix(3).joined(separator: " · "))
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .lineLimit(2)
                }

                CSButton(title: actionTitle, variant: .outline, size: .sm, isFullWidth: false, action: onAction)
            }
        }
    }
}

struct NoteTemplatePickerView: View {
    let title: String
    let templates: [NoteTemplate]
    @Binding var selectedTemplate: NoteTemplate

    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""

    private var filteredTemplates: [NoteTemplate] {
        NoteTemplateCatalog.searchResults(for: searchText, templates: templates)
    }

    private var filteredGroups: [NoteTemplateGroup] {
        if searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return NoteTemplateCatalog.groups(for: templates)
        }

        let grouped = Dictionary(grouping: filteredTemplates) { template in
            template.kind == .meeting ? "Meetings" :
            template.kind == .letter ? "Letters" :
            template.kind == .form ? "Forms" :
            template.kind == .patientEducation ? "Patient Education" :
            template.kind == .planning ? "Planning" :
            template.specialty != nil ? "Specialty Packs" : "Clinical Notes"
        }

        return NoteTemplateCatalog.categoryOrder.compactMap { category in
            guard let templates = grouped[category], !templates.isEmpty else { return nil }
            return NoteTemplateGroup(
                id: category.lowercased().replacingOccurrences(of: " ", with: "-"),
                title: category,
                templates: templates.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
            )
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.spacingLg) {
                    CSSearchBar(text: $searchText, placeholder: "Search templates")

                    Text("All Templates")
                        .font(.headline)
                        .foregroundStyle(Theme.onSurface)

                    if filteredGroups.isEmpty {
                        VStack(spacing: Theme.spacingSm) {
                            Image(systemName: "doc.text.magnifyingglass")
                                .font(.title2)
                                .foregroundStyle(Theme.onSurfaceVariant)
                            Text("No templates found")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.onSurface)
                            Text("Try a different search term.")
                                .font(.caption)
                                .foregroundStyle(Theme.onSurfaceVariant)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Theme.spacingXL)
                    } else {
                        ForEach(filteredGroups) { group in
                            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                                Text(group.title.uppercased())
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(Theme.onSurfaceVariant)
                                    .tracking(1.2)

                                VStack(spacing: Theme.spacingSm) {
                                    ForEach(group.templates) { template in
                                        TemplateRow(
                                            template: template,
                                            isSelected: template.id == selectedTemplate.id
                                        ) {
                                            selectedTemplate = template
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(Theme.spacingMd)
            }
            .background(Theme.surface)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.onSurface)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.primary)
                }
            }
        }
    }
}

private struct TemplateRow: View {
    let template: NoteTemplate
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(alignment: .top, spacing: Theme.spacingMd) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: Theme.spacingSm) {
                        Text(template.name)
                            .font(.body.weight(.semibold))
                            .foregroundStyle(Theme.onSurface)
                            .multilineTextAlignment(.leading)
                        if isSelected {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(Theme.secondary)
                        }
                    }

                    Text(template.description)
                        .font(.caption)
                        .foregroundStyle(Theme.onSurfaceVariant)
                        .multilineTextAlignment(.leading)
                        .lineLimit(2)

                    HStack(spacing: Theme.spacingSm) {
                        if let specialty = template.specialty, !specialty.isEmpty {
                            CSBadge(text: specialty)
                        }
                        CSBadge(text: template.kind.rawValue.replacingOccurrences(of: "_", with: " ").capitalized, variant: .info)
                        CSBadge(text: template.preferredFormat.rawValue.replacingOccurrences(of: "_", with: " ").capitalized)
                    }
                }

                Spacer()
            }
            .padding(.vertical, Theme.spacingSm)
            .padding(.horizontal, Theme.spacingMd)
            .background(isSelected ? Theme.secondary.opacity(0.08) : Theme.surfaceContainerLow)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusMd))
            .overlay {
                RoundedRectangle(cornerRadius: Theme.radiusMd)
                    .stroke(isSelected ? Theme.secondary : Theme.outlineVariant, lineWidth: isSelected ? 1.5 : 1)
            }
        }
    }
}
