'use client';

import { useMemo, useState } from 'react';
import { Copy, Pencil, Plus, Search, Star } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import {
  createClinicTemplate,
  duplicateClinicTemplate,
  updateClinicTemplate,
  type TemplateUpsertInput,
} from '@/lib/api/templates';
import { useWorkspaceTemplates } from '@/lib/hooks/useWorkspaceTemplates';
import {
  formatTemplateCategoryLabel,
  matchesTemplateWorkspaceTab,
  type WorkspaceTemplate,
  type WorkspaceTemplateTab,
} from '@/lib/templates/runtime';
import { TemplateEditorDialog, type TemplateEditorValues } from '@/components/templates/TemplateEditorDialog';
import { CommunityTemplatesDialog } from '@/components/templates/CommunityTemplatesDialog';
import { formatDate } from '@/lib/utils';

const FAVORITES_STORAGE_KEY = 'clinicscribe.favorite-template-keys';

function formatTemplateDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  return formatDate(value);
}

function mapEditorValues(values: TemplateEditorValues): TemplateUpsertInput {
  return {
    name: values.name,
    category: values.category,
    outputKind: values.outputKind,
    specialty: values.specialty,
    description: values.description,
    promptInstructions: values.promptInstructions,
    sections: values.sections,
    tags: values.tags,
    isDefault: values.isDefault,
  };
}

export default function TemplatesPage() {
  const profile = useAuthStore((state) => state.profile);
  const addToast = useUIStore((state) => state.addToast);
  const { templates, loading, refresh } = useWorkspaceTemplates();
  const [tab, setTab] = useState<WorkspaceTemplateTab>('all');
  const [query, setQuery] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === 'string')
        : [];
    } catch {
      return [];
    }
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkspaceTemplate | null>(null);
  const [communityOpen, setCommunityOpen] = useState(false);

  function persistFavorites(nextFavorites: string[]) {
    setFavorites(nextFavorites);
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
  }

  function toggleFavorite(templateKey: string) {
    persistFavorites(
      favorites.includes(templateKey)
        ? favorites.filter((value) => value !== templateKey)
        : [...favorites, templateKey]
    );
  }

  const creatorOptions = useMemo(() => {
    const uniqueCreators = Array.from(
      new Set(templates.map((template) => template.creatorName).filter(Boolean))
    ) as string[];

    return [
      { label: 'Created by', value: 'all' },
      { label: 'System', value: 'system' },
      ...uniqueCreators.map((creator) => ({ label: creator, value: creator })),
    ];
  }, [templates]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const now = new Date();

    return templates.filter((template) => {
      if (!matchesTemplateWorkspaceTab(template, tab)) {
        return false;
      }

      if (creatorFilter === 'system' && template.source !== 'system') {
        return false;
      }
      if (
        creatorFilter !== 'all' &&
        creatorFilter !== 'system' &&
        template.creatorName !== creatorFilter
      ) {
        return false;
      }

      if (dateFilter === 'recent' && !template.updatedAt) {
        return false;
      }
      if (dateFilter === 'recent' && template.updatedAt) {
        const diffDays =
          (now.getTime() - new Date(template.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
      }
      if (dateFilter === 'used' && !template.lastUsedAt) {
        return false;
      }
      if (dateFilter === 'unused' && template.lastUsedAt) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        template.name,
        template.description,
        template.specialty ?? '',
        template.tags.join(' '),
        template.creatorName ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [creatorFilter, dateFilter, query, tab, templates]);

  const favoriteTemplates = useMemo(
    () => templates.filter((template) => favorites.includes(template.key)).slice(0, 4),
    [favorites, templates]
  );

  async function handleSaveTemplate(values: TemplateEditorValues) {
    if (!profile?.clinic_id) {
      throw new Error('Clinic context is unavailable.');
    }

    if (editingTemplate?.source === 'clinic' && editingTemplate.templateId) {
      await updateClinicTemplate(
        editingTemplate.templateId,
        profile.clinic_id,
        mapEditorValues(values),
        profile.id,
        editingTemplate.key
      );
      addToast('Template updated', 'success');
    } else {
      await createClinicTemplate(profile.clinic_id, mapEditorValues(values), profile?.id ?? null);
      addToast('Template created', 'success');
    }
    setEditingTemplate(null);
    await refresh();
  }

  async function handleDuplicateTemplate(template: WorkspaceTemplate) {
    if (!profile?.clinic_id) return;

    try {
      await duplicateClinicTemplate(
        profile.clinic_id,
        {
          name: template.name,
          category: template.category,
          output_kind: template.output_kind,
          specialty: template.specialty,
          description: template.description,
          prompt_instructions: template.prompt_instructions,
          sections: template.sections,
          tags: template.tags,
          format: template.format,
        },
        profile.id
      );
      addToast('Template duplicated to your clinic library', 'success');
      await refresh();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to duplicate template', 'error');
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Templates"
        description="Build your clinic template library, pin the ones you use every day, and keep the note structure consistent across the team."
        variant="feature"
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCommunityOpen(true)}
            >
              Browse community
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingTemplate(null);
                setEditorOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create template
            </Button>
          </>
        }
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant/30 pb-3">
          {([
            ['all', 'All'],
            ['notes', 'Notes'],
            ['docs', 'Docs'],
            ['forms', 'Forms'],
          ] satisfies Array<[WorkspaceTemplateTab, string]>).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`border-b-2 px-1 pb-2 text-sm font-medium transition ${
                tab === value
                  ? 'border-primary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-on-surface">Favourites</p>
          <div className="grid gap-4 md:grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))]">
            <button
              type="button"
              onClick={() => {
                setEditingTemplate(null);
                setEditorOpen(true);
              }}
              className="flex min-h-[140px] items-center justify-center rounded-[1.75rem] border border-dashed border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant transition hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
            >
              <Plus className="h-7 w-7" />
            </button>

            {favoriteTemplates.map((template) => (
              <div
                key={template.key}
                className="rounded-[1.75rem] border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{template.name}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {template.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(template.key)}
                    className="rounded-full p-2 text-warning transition hover:bg-warning/10"
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{formatTemplateCategoryLabel(template.category)}</Badge>
                  {template.is_default ? <Badge variant="info">Default</Badge> : null}
                </div>
              </div>
            ))}

            {!loading && favoriteTemplates.length === 0 ? (
              <div className="rounded-[1.75rem] border border-outline-variant/40 bg-surface-container-low px-5 py-6 text-sm text-on-surface-variant">
                Pin templates you use often and they will stay here for one-click access.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-on-surface">Library</p>
          <p className="text-sm text-on-surface-variant">{filtered.length} templates</p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="flex-1"
            value={query}
            onSearch={setQuery}
            placeholder="Search for a template"
          />
          <Select
            className="lg:w-52"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            options={[
              { label: 'Date', value: 'all' },
              { label: 'Edited in last 30 days', value: 'recent' },
              { label: 'Used at least once', value: 'used' },
              { label: 'Never used', value: 'unused' },
            ]}
          />
          <Select
            className="lg:w-48"
            value={creatorFilter}
            onChange={(event) => setCreatorFilter(event.target.value)}
            options={creatorOptions}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No templates matched"
            description="Try widening the search or create a clinic-specific template."
            actionLabel="Create template"
            onAction={() => {
              setEditingTemplate(null);
              setEditorOpen(true);
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-outline-variant/40 bg-surface-container-lowest shadow-ambient-sm">
            <div className="grid grid-cols-[minmax(0,2.2fr)_120px_120px_140px_120px_128px] gap-4 border-b border-outline-variant/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              <span>Template name</span>
              <span>Last edited</span>
              <span>Last used</span>
              <span>Creator</span>
              <span>Visibility</span>
              <span className="text-right">Actions</span>
            </div>
            <div>
              {filtered.map((template) => {
                const isFavorite = favorites.includes(template.key);
                return (
                  <div
                    key={template.key}
                    className="grid grid-cols-[minmax(0,2.2fr)_120px_120px_140px_120px_128px] gap-4 border-b border-outline-variant/20 px-4 py-3 text-sm last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-on-surface">{template.name}</p>
                        <Badge>{formatTemplateCategoryLabel(template.category)}</Badge>
                        {template.is_default ? <Badge variant="info">Default</Badge> : null}
                      </div>
                      <p className="mt-1 truncate text-on-surface-variant">
                        {template.description}
                      </p>
                    </div>
                    <span className="text-on-surface-variant">
                      {formatTemplateDate(template.updatedAt)}
                    </span>
                    <span className="text-on-surface-variant">
                      {formatTemplateDate(template.lastUsedAt)}
                    </span>
                    <span className="truncate text-on-surface-variant">
                      {template.creatorName || 'Miraa'}
                    </span>
                    <span className="text-on-surface-variant">{template.visibilityLabel}</span>
                    <div className="flex items-center justify-end gap-1">
                      {template.editable ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTemplate(template);
                            setEditorOpen(true);
                          }}
                          className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(template.key)}
                        className={`rounded-lg p-2 transition hover:bg-surface-container ${
                          isFavorite ? 'text-warning' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateTemplate(template)}
                        className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <TemplateEditorDialog
        open={editorOpen}
        mode={editingTemplate ? 'edit' : 'create'}
        template={editingTemplate}
        onClose={() => {
          setEditorOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
      />

      <CommunityTemplatesDialog
        open={communityOpen}
        onClose={() => setCommunityOpen(false)}
        templates={templates}
        onUseTemplate={async (template) => {
          await handleDuplicateTemplate(template);
          setCommunityOpen(false);
        }}
      />
    </div>
  );
}
