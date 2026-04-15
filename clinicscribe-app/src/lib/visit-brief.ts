import type { VisitBrief } from '@/lib/types';

const visitBriefListKeys = [
  'active_problems',
  'medication_changes',
  'abnormal_results',
  'unresolved_items',
  'likely_agenda',
  'clarification_questions',
] as const satisfies readonly (keyof VisitBrief)[];

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function normalizeSourceContext(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

export function normalizeVisitBrief(
  brief: VisitBrief | Partial<VisitBrief> | null | undefined
): VisitBrief | null {
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) return null;

  const normalized = {
    ...brief,
    source_context: normalizeSourceContext(brief.source_context),
  } as VisitBrief;

  for (const key of visitBriefListKeys) {
    normalized[key] = normalizeStringList(brief[key]);
  }

  return normalized;
}
