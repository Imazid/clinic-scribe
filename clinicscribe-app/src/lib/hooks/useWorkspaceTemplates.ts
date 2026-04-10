'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { NoteTemplate } from '@/lib/types';
import {
  formatTemplateCreatorName,
  listClinicTemplates,
  listTemplateUsage,
  listTemplateVersions,
} from '@/lib/api/templates';
import type { TemplateUsageStats, TemplateVersionSummary, WorkspaceTemplate } from '@/lib/templates/runtime';
import { mergeWorkspaceTemplates, resolveWorkspaceTemplate } from '@/lib/templates/runtime';

export function useWorkspaceTemplates() {
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const [clinicTemplates, setClinicTemplates] = useState<NoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!clinicId) {
      setClinicTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const templates = await listClinicTemplates(clinicId);
      setClinicTemplates(templates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const [usageByKey, setUsageByKey] = useState<Record<string, TemplateUsageStats>>({});
  const [versionSummaryByTemplateId, setVersionSummaryByTemplateId] = useState<
    Record<string, TemplateVersionSummary>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      if (!clinicId) {
        setUsageByKey({});
        setVersionSummaryByTemplateId({});
        return;
      }

      try {
        const [usageRows, versionRows] = await Promise.all([
          listTemplateUsage(clinicId),
          clinicTemplates.length > 0
            ? listTemplateVersions(clinicTemplates.map((template) => template.id))
            : Promise.resolve([]),
        ]);

        if (cancelled) return;

        const nextUsage: Record<string, TemplateUsageStats> = {};
        usageRows.forEach((row) => {
          const current = nextUsage[row.template_key] ?? { usageCount: 0, lastUsedAt: null };
          current.usageCount += 1;
          if (!current.lastUsedAt || row.updated_at > current.lastUsedAt) {
            current.lastUsedAt = row.updated_at;
          }
          nextUsage[row.template_key] = current;
        });

        const nextVersionSummary: Record<string, TemplateVersionSummary> = {};
        versionRows.forEach((row) => {
          const current = nextVersionSummary[row.note_template_id] ?? {
            versionCount: 0,
            creatorName: null,
          };
          current.versionCount += 1;
          if (!current.creatorName) {
            current.creatorName = formatTemplateCreatorName(row);
          }
          nextVersionSummary[row.note_template_id] = current;
        });

        setUsageByKey(nextUsage);
        setVersionSummaryByTemplateId(nextVersionSummary);
      } catch {
        if (!cancelled) {
          setUsageByKey({});
          setVersionSummaryByTemplateId({});
        }
      }
    }

    loadMetadata();
    return () => {
      cancelled = true;
    };
  }, [clinicId, clinicTemplates]);

  const templates = useMemo<WorkspaceTemplate[]>(
    () =>
      mergeWorkspaceTemplates({
        clinicTemplates,
        usageByKey,
        versionSummaryByTemplateId,
      }),
    [clinicTemplates, usageByKey, versionSummaryByTemplateId]
  );

  const defaultTemplate = useMemo(
    () => resolveWorkspaceTemplate(null, templates),
    [templates]
  );

  const resolveByKey = useCallback(
    (templateKey: string | null | undefined) => resolveWorkspaceTemplate(templateKey, templates),
    [templates]
  );

  return {
    clinicTemplates,
    templates,
    defaultTemplate,
    resolveByKey,
    loading,
    error,
    refresh,
  };
}
