'use client';

import { createClient } from '@/lib/supabase/client';
import type {
  NoteTemplate,
  NoteFormat,
  TemplateCategory,
  TemplateOutputKind,
  TemplateVersion,
} from '@/lib/types';
import {
  buildTemplateKey,
  buildTemplateStructure,
  buildTemplateVersionConfig,
  normalizeTemplateSections,
} from '@/lib/templates/runtime';

const supabase = () => createClient();

export interface TemplateUpsertInput {
  name: string;
  category: TemplateCategory;
  outputKind: TemplateOutputKind;
  specialty: string;
  description: string;
  promptInstructions: string;
  sections: string[];
  tags: string[];
  format?: NoteFormat;
  isDefault?: boolean;
}

interface TemplateVersionRow extends Pick<TemplateVersion, 'note_template_id' | 'version' | 'created_at' | 'created_by'> {
  creator?: { first_name?: string | null; last_name?: string | null } | null;
}

export async function listClinicTemplates(clinicId: string) {
  const { data, error } = await supabase()
    .from('note_templates')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as NoteTemplate[];
}

export async function listTemplateVersions(templateIds: string[]) {
  if (templateIds.length === 0) {
    return [] as Array<TemplateVersionRow>;
  }

  const { data, error } = await supabase()
    .from('note_template_versions')
    .select('note_template_id, version, created_at, created_by, creator:profiles(first_name, last_name)')
    .in('note_template_id', templateIds)
    .order('version', { ascending: true });

  if (error) throw error;
  return (data || []) as Array<TemplateVersionRow>;
}

export async function listTemplateUsage(clinicId: string) {
  const { data, error } = await supabase()
    .from('consultations')
    .select('template_key, updated_at')
    .eq('clinic_id', clinicId)
    .not('template_key', 'is', null);

  if (error) throw error;
  return (data || []) as Array<{ template_key: string; updated_at: string }>;
}

async function setClinicDefaultTemplate(clinicId: string, excludeTemplateId?: string) {
  let query = supabase()
    .from('note_templates')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('clinic_id', clinicId)
    .eq('is_system', false);

  if (excludeTemplateId) {
    query = query.neq('id', excludeTemplateId);
  }

  const { error } = await query;
  if (error) throw error;
}

async function getNextTemplateVersion(templateId: string) {
  const { data, error } = await supabase()
    .from('note_template_versions')
    .select('version')
    .eq('note_template_id', templateId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.version ?? 0) + 1;
}

async function createTemplateVersion(template: NoteTemplate, profileId: string | null) {
  const version = await getNextTemplateVersion(template.id);

  const { error } = await supabase().from('note_template_versions').insert({
    note_template_id: template.id,
    version,
    name: template.name,
    config: buildTemplateVersionConfig(template),
    created_by: profileId,
  });

  if (error) throw error;
}

function buildTemplateRecord(clinicId: string, input: TemplateUpsertInput, key?: string) {
  const sections = normalizeTemplateSections(input.sections);
  const format = input.format ?? 'soap';

  return {
    clinic_id: clinicId,
    key: key ?? buildTemplateKey(input.name),
    name: input.name.trim(),
    format,
    category: input.category,
    output_kind: input.outputKind,
    specialty: input.specialty.trim() || null,
    description: input.description.trim() || null,
    prompt_instructions: input.promptInstructions.trim() || null,
    system_prompt_override: null,
    sections,
    structure: buildTemplateStructure(sections),
    tags: input.tags.filter(Boolean),
    sort_order: Date.now(),
    is_default: Boolean(input.isDefault),
    is_system: false,
    updated_at: new Date().toISOString(),
  } satisfies Omit<NoteTemplate, 'id' | 'created_at'>;
}

export async function createClinicTemplate(
  clinicId: string,
  input: TemplateUpsertInput,
  profileId: string | null
) {
  if (input.isDefault) {
    await setClinicDefaultTemplate(clinicId);
  }

  const record = buildTemplateRecord(clinicId, input);
  const { data, error } = await supabase()
    .from('note_templates')
    .insert(record)
    .select('*')
    .single();

  if (error) throw error;

  const template = data as NoteTemplate;
  await createTemplateVersion(template, profileId);
  return template;
}

export async function updateClinicTemplate(
  templateId: string,
  clinicId: string,
  input: TemplateUpsertInput,
  profileId: string | null,
  currentKey: string
) {
  if (input.isDefault) {
    await setClinicDefaultTemplate(clinicId, templateId);
  }

  const record = buildTemplateRecord(clinicId, input, currentKey);
  const { data, error } = await supabase()
    .from('note_templates')
    .update(record)
    .eq('id', templateId)
    .select('*')
    .single();

  if (error) throw error;

  const template = data as NoteTemplate;
  await createTemplateVersion(template, profileId);
  return template;
}

export async function duplicateClinicTemplate(
  clinicId: string,
  template: Pick<
    NoteTemplate,
    | 'name'
    | 'category'
    | 'output_kind'
    | 'specialty'
    | 'description'
    | 'prompt_instructions'
    | 'sections'
    | 'tags'
    | 'format'
  >,
  profileId: string | null
) {
  return createClinicTemplate(
    clinicId,
    {
      name: `${template.name} Copy`,
      category: template.category,
      outputKind: template.output_kind,
      specialty: template.specialty ?? '',
      description: template.description ?? '',
      promptInstructions: template.prompt_instructions ?? '',
      sections: template.sections,
      tags: template.tags,
      format: template.format,
      isDefault: false,
    },
    profileId
  );
}

export function formatTemplateCreatorName(row: TemplateVersionRow) {
  const creator = row.creator;
  const normalizedCreator = Array.isArray(creator) ? creator[0] : creator;
  if (!normalizedCreator) return null;
  const parts = [normalizedCreator.first_name, normalizedCreator.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
}
