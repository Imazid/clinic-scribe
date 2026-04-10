import SwiftUI

private enum TemplateWorkspaceFilter: String, CaseIterable {
    case all = "All"
    case notes = "Notes"
    case docs = "Docs"
    case forms = "Forms"

    func matches(_ template: NoteTemplate) -> Bool {
        switch self {
        case .all:
            return true
        case .notes:
            return template.kind == .clinicalNote || template.kind == .patientEducation || template.kind == .planning
        case .docs:
            return template.kind == .letter || template.kind == .meeting
        case .forms:
            return template.kind == .form
        }
    }
}

struct TemplatesWorkspaceView: View {
    @ObservedObject private var auth = AuthService.shared
    @State private var searchText = ""
    @State private var filter: TemplateWorkspaceFilter = .all
    @State private var templates: [NoteTemplate] = NoteTemplateCatalog.allTemplates
    @State private var isLoading = true
    @State private var errorMessage: String?
    @AppStorage("templates.favorite.ids") private var favoriteIDsStorage = ""

    private var favoriteIDs: Set<String> {
        Set(
            favoriteIDsStorage
                .split(separator: ",")
                .map { String($0) }
                .filter { !$0.isEmpty }
        )
    }

    private var favoriteTemplates: [NoteTemplate] {
        filteredTemplates.filter { favoriteIDs.contains($0.id) }
    }

    private var filteredTemplates: [NoteTemplate] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return templates
            .filter { filter.matches($0) }
            .filter { query.isEmpty || $0.searchText.contains(query) }
            .sorted { lhs, rhs in
                if lhs.isDefault != rhs.isDefault {
                    return lhs.isDefault && !rhs.isDefault
                }
                return lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
            }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingLg) {
                CSPageHeader(
                    title: "My Templates",
                    subtitle: "Review the template library used for capture, note review, and closeout work."
                )

                favoritesSection
                filterSection
                librarySection
            }
            .padding(Theme.spacingLg)
        }
        .background(Theme.surface)
        .navigationTitle("My Templates")
        .task { await loadTemplates() }
        .refreshable { await loadTemplates() }
    }

    private var favoritesSection: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            sectionHeader("Favourites")

            if favoriteTemplates.isEmpty {
                CSCard(variant: .filled) {
                    VStack(alignment: .leading, spacing: Theme.spacingXS) {
                        Text("Pin the templates you use most")
                            .font(.headline)
                            .foregroundStyle(Theme.onSurface)
                        Text("Use the star in the library below to keep frequent note structures within quick reach.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.onSurfaceVariant)
                    }
                }
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Theme.spacingMd) {
                        ForEach(favoriteTemplates) { template in
                            CSCard(variant: .filled) {
                                VStack(alignment: .leading, spacing: Theme.spacingSm) {
                                    Text(template.name)
                                        .font(.headline)
                                        .foregroundStyle(Theme.onSurface)
                                    Text(template.displaySubtitle)
                                        .font(.caption)
                                        .foregroundStyle(Theme.onSurfaceVariant)
                                    HStack(spacing: Theme.spacingSm) {
                                        templateBadge(for: template)
                                        if template.isDefault {
                                            CSBadge(text: "Default", variant: .info)
                                        }
                                    }
                                }
                                .frame(width: 220, alignment: .leading)
                            }
                        }
                    }
                }
            }
        }
    }

    private var filterSection: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            sectionHeader("Library")
            CSSearchBar(text: $searchText, placeholder: "Search templates")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.spacingSm) {
                    ForEach(TemplateWorkspaceFilter.allCases, id: \.self) { option in
                        CSFilterChip(title: option.rawValue, isSelected: filter == option) {
                            filter = option
                        }
                    }
                }
            }
        }
    }

    private var librarySection: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSm) {
            if let errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(Theme.error)
            }

            if isLoading {
                ProgressView("Loading templates...")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.spacingLg)
                    .cardStyle()
            } else if filteredTemplates.isEmpty {
                CSEmptyState(
                    icon: "doc.text.magnifyingglass",
                    title: "No templates found",
                    description: "Try a different search or filter to widen the template library."
                )
                .frame(maxWidth: .infinity)
                .cardStyle()
            } else {
                ForEach(filteredTemplates) { template in
                    CSCard(variant: .filled) {
                        HStack(alignment: .top, spacing: Theme.spacingMd) {
                            VStack(alignment: .leading, spacing: Theme.spacingSm) {
                                HStack(spacing: Theme.spacingSm) {
                                    Text(template.name)
                                        .font(.headline)
                                        .foregroundStyle(Theme.onSurface)
                                    if template.isDefault {
                                        CSBadge(text: "Default", variant: .info)
                                    }
                                }

                                Text(template.description)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                                    .fixedSize(horizontal: false, vertical: true)

                                HStack(spacing: Theme.spacingSm) {
                                    templateBadge(for: template)
                                    CSBadge(text: template.preferredFormat.rawValue.replacingOccurrences(of: "_", with: " ").capitalized)
                                    if let specialty = template.specialty, !specialty.isEmpty {
                                        CSBadge(text: specialty)
                                    }
                                }

                                Text(template.sections.prefix(4).joined(separator: " · "))
                                    .font(.caption)
                                    .foregroundStyle(Theme.onSurfaceVariant)
                                    .lineLimit(2)
                            }

                            Spacer(minLength: 0)

                            Button {
                                toggleFavorite(id: template.id)
                            } label: {
                                Image(systemName: favoriteIDs.contains(template.id) ? "star.fill" : "star")
                                    .foregroundStyle(favoriteIDs.contains(template.id) ? Theme.warning : Theme.onSurfaceVariant)
                                    .font(.headline)
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel(favoriteIDs.contains(template.id) ? "Remove from favourites" : "Add to favourites")
                        }
                    }
                }
            }
        }
    }

    private func templateBadge(for template: NoteTemplate) -> some View {
        CSBadge(text: template.kind.rawValue.replacingOccurrences(of: "_", with: " ").capitalized, variant: .info)
    }

    private func toggleFavorite(id: String) {
        var values = favoriteIDs
        if values.contains(id) {
            values.remove(id)
        } else {
            values.insert(id)
        }
        favoriteIDsStorage = values.sorted().joined(separator: ",")
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(Theme.onSurfaceVariant)
            .padding(.horizontal, Theme.spacingXS)
    }

    private func loadTemplates() async {
        isLoading = true
        errorMessage = nil

        do {
            templates = try await TemplateLibraryService.shared.loadTemplates(clinicId: auth.clinicId)
        } catch {
            templates = NoteTemplateCatalog.allTemplates
            errorMessage = "Unable to load clinic templates right now. Showing built-in templates only."
        }

        isLoading = false
    }
}
