import type {
  NoteTemplate,
  TemplateCatalogItem,
  TemplateCategory,
  TemplateOutputKind,
  TemplateSectionDefinition,
  TemplateVersion,
} from '@/lib/types';
import { DEFAULT_TEMPLATE_KEY, TEMPLATE_CATALOG, getTemplateByKey } from '@/lib/templates/catalog';

export type WorkspaceTemplateTab = 'all' | 'notes' | 'docs' | 'forms';

export interface TemplateUsageStats {
  usageCount: number;
  lastUsedAt: string | null;
}

export interface TemplateVersionSummary {
  versionCount: number;
  creatorName: string | null;
}

export interface WorkspaceTemplate extends TemplateCatalogItem {
  templateId: string | null;
  source: 'system' | 'clinic';
  editable: boolean;
  visibilityLabel: 'System' | 'Clinic';
  creatorName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastUsedAt: string | null;
  usageCount: number;
  versionCount: number;
}

const DEFAULT_SECTION_GUIDANCE = 'Capture the clinically relevant detail for this section.';

export function formatTemplateCategoryLabel(category: TemplateCategory) {
  switch (category) {
    case 'clinical_note':
      return 'Clinical Note';
    case 'clinic_letter':
      return 'Clinic Letter';
    case 'referral_letter':
      return 'Referral Letter';
    case 'patient_communication':
      return 'Patient Communication';
    case 'meeting_note':
      return 'Meeting Note';
    case 'certificate':
      return 'Certificate';
    case 'form':
      return 'Form';
    case 'care_planning':
      return 'Care Planning';
  }
}

export function formatTemplateOutputLabel(outputKind: TemplateOutputKind) {
  switch (outputKind) {
    case 'note':
      return 'Note';
    case 'letter':
      return 'Letter';
    case 'meeting':
      return 'Meeting';
    case 'certificate':
      return 'Certificate';
    case 'form':
      return 'Form';
    case 'patient_summary':
      return 'Patient Summary';
    case 'goals':
      return 'Goals';
  }
}

export function buildTemplateKey(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `clinic-${base || 'template'}-${suffix}`;
}

function humanizeSectionTitle(section: string) {
  return section
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function inferSectionMapping(section: string): TemplateSectionDefinition['maps_to'] {
  const normalized = section.toLowerCase();
  if (normalized.includes('subjective')) return 'subjective';
  if (normalized.includes('objective')) return 'objective';
  if (normalized.includes('assessment')) return 'assessment';
  if (normalized.includes('plan')) return 'plan';
  return 'document';
}

export function buildTemplateStructure(sections: string[]): TemplateSectionDefinition[] {
  return sections.map((rawSection) => {
    const title = humanizeSectionTitle(rawSection);
    const key = rawSection
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return {
      key: key || title.toLowerCase().replace(/\s+/g, '-'),
      title,
      guidance: `${DEFAULT_SECTION_GUIDANCE} Focus on ${title.toLowerCase()}.`,
      required: true,
      maps_to: inferSectionMapping(rawSection),
    };
  });
}

export function normalizeTemplateSections(input: string[] | string) {
  const sections = Array.isArray(input)
    ? input
    : input
        .split('\n')
        .map((section) => section.trim())
        .filter(Boolean);

  return Array.from(new Set(sections.map((section) => humanizeSectionTitle(section))));
}

export function normalizeTemplateStructure(
  structure: unknown,
  fallbackSections: string[]
): TemplateSectionDefinition[] {
  if (Array.isArray(structure)) {
    const normalized = structure
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const section = item as Partial<TemplateSectionDefinition>;
        const title = typeof section.title === 'string' ? section.title.trim() : '';
        if (!title) return null;

        return {
          key:
            typeof section.key === 'string' && section.key.trim().length > 0
              ? section.key
              : title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title,
          guidance:
            typeof section.guidance === 'string' && section.guidance.trim().length > 0
              ? section.guidance
              : `${DEFAULT_SECTION_GUIDANCE} Focus on ${title.toLowerCase()}.`,
          required: section.required !== false,
          maps_to:
            section.maps_to === 'subjective' ||
            section.maps_to === 'objective' ||
            section.maps_to === 'assessment' ||
            section.maps_to === 'plan' ||
            section.maps_to === 'document'
              ? section.maps_to
              : inferSectionMapping(title),
        } satisfies TemplateSectionDefinition;
      })
      .filter((item): item is TemplateSectionDefinition => Boolean(item));

    if (normalized.length > 0) {
      return normalized;
    }
  }

  return buildTemplateStructure(fallbackSections);
}

export function normalizeClinicTemplate(template: NoteTemplate): TemplateCatalogItem {
  const sections = normalizeTemplateSections(template.sections);

  return {
    key: template.key,
    name: template.name,
    category: template.category,
    output_kind: template.output_kind,
    specialty: template.specialty,
    description:
      template.description?.trim() ||
      'Clinic-specific documentation template created for your team.',
    prompt_instructions:
      template.prompt_instructions?.trim() ||
      'Adapt the note to the structure and tone of this clinic template.',
    format: template.format,
    sections,
    structure: normalizeTemplateStructure(template.structure, sections),
    tags: template.tags || [],
    sort_order: template.sort_order,
    is_default: template.is_default,
  };
}

export function mergeWorkspaceTemplates(params: {
  clinicTemplates: NoteTemplate[];
  usageByKey?: Record<string, TemplateUsageStats>;
  versionSummaryByTemplateId?: Record<string, TemplateVersionSummary>;
}) {
  const { clinicTemplates, usageByKey = {}, versionSummaryByTemplateId = {} } = params;

  const systemTemplates: WorkspaceTemplate[] = TEMPLATE_CATALOG.map((template) => ({
    ...template,
    templateId: null,
    source: 'system',
    editable: false,
    visibilityLabel: 'System',
    creatorName: 'Miraa',
    createdAt: null,
    updatedAt: null,
    lastUsedAt: usageByKey[template.key]?.lastUsedAt ?? null,
    usageCount: usageByKey[template.key]?.usageCount ?? 0,
    versionCount: 1,
  }));

  const clinicEntries: WorkspaceTemplate[] = clinicTemplates.map((template) => {
    const normalized = normalizeClinicTemplate(template);
    const versionSummary = versionSummaryByTemplateId[template.id];
    const usage = usageByKey[template.key] ?? { usageCount: 0, lastUsedAt: null };

    return {
      ...normalized,
      templateId: template.id,
      source: 'clinic',
      editable: true,
      visibilityLabel: 'Clinic',
      creatorName: versionSummary?.creatorName ?? null,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      lastUsedAt: usage.lastUsedAt,
      usageCount: usage.usageCount,
      versionCount: versionSummary?.versionCount ?? 1,
    };
  });

  return [...clinicEntries, ...systemTemplates].sort((a, b) => {
    if (a.source !== b.source) {
      return a.source === 'clinic' ? -1 : 1;
    }
    if (a.is_default !== b.is_default) {
      return a.is_default ? -1 : 1;
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.name.localeCompare(b.name);
  });
}

export function resolveWorkspaceTemplate(
  templateKey: string | null | undefined,
  templates: WorkspaceTemplate[]
) {
  if (!templateKey) {
    return (
      templates.find((template) => template.is_default) ??
      templates.find((template) => template.key === DEFAULT_TEMPLATE_KEY) ??
      templates[0] ??
      toWorkspaceTemplate(getTemplateByKey(DEFAULT_TEMPLATE_KEY))
    );
  }

  return (
    templates.find((template) => template.key === templateKey) ??
    templates.find((template) => template.key === DEFAULT_TEMPLATE_KEY) ??
    toWorkspaceTemplate(getTemplateByKey(DEFAULT_TEMPLATE_KEY))
  );
}

export function matchesTemplateWorkspaceTab(
  template: Pick<WorkspaceTemplate, 'category' | 'output_kind'>,
  tab: WorkspaceTemplateTab
) {
  if (tab === 'all') return true;
  if (tab === 'forms') return template.output_kind === 'form' || template.category === 'form';
  if (tab === 'notes') {
    return ['clinical_note', 'meeting_note', 'care_planning'].includes(template.category);
  }
  return ['clinic_letter', 'referral_letter', 'patient_communication', 'certificate'].includes(
    template.category
  );
}

export function toWorkspaceTemplate(template: TemplateCatalogItem): WorkspaceTemplate {
  return {
    ...template,
    templateId: null,
    source: 'system',
    editable: false,
    visibilityLabel: 'System',
    creatorName: 'Miraa',
    createdAt: null,
    updatedAt: null,
    lastUsedAt: null,
    usageCount: 0,
    versionCount: 1,
  };
}

export function buildTemplateVersionConfig(template: Pick<
  NoteTemplate,
  | 'key'
  | 'name'
  | 'format'
  | 'category'
  | 'output_kind'
  | 'specialty'
  | 'description'
  | 'prompt_instructions'
  | 'system_prompt_override'
  | 'sections'
  | 'structure'
  | 'tags'
  | 'sort_order'
  | 'is_default'
  | 'is_system'
>) {
  return {
    key: template.key,
    name: template.name,
    format: template.format,
    category: template.category,
    output_kind: template.output_kind,
    specialty: template.specialty,
    description: template.description,
    prompt_instructions: template.prompt_instructions,
    system_prompt_override: template.system_prompt_override,
    sections: template.sections,
    structure: template.structure,
    tags: template.tags,
    sort_order: template.sort_order,
    is_default: template.is_default,
    is_system: template.is_system,
  } satisfies TemplateVersion['config'];
}
