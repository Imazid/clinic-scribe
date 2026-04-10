'use client';

import { useMemo, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WORKFLOW_PACKS, getWorkflowPackByTemplateKey } from '@/lib/workflow/packs';
import { cn } from '@/lib/utils';
import { formatTemplateCategoryLabel, type WorkspaceTemplate } from '@/lib/templates/runtime';

interface TemplatePickerDialogProps {
  open: boolean;
  templates: WorkspaceTemplate[];
  selectedKey?: string | null;
  onClose: () => void;
  onSelect: (template: WorkspaceTemplate) => void;
}

export function TemplatePickerDialog({
  open,
  templates,
  selectedKey,
  onClose,
  onSelect,
}: TemplatePickerDialogProps) {
  const [query, setQuery] = useState('');
  const [packFilter, setPackFilter] = useState<string>('all');
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      templates.filter((template) => {
        if (packFilter !== 'all') {
          const pack = getWorkflowPackByTemplateKey(template.key);
          if (!pack || pack.key !== packFilter) {
            return false;
          }
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          template.name,
          template.description,
          template.specialty ?? '',
          template.category,
          template.tags.join(' '),
        ].join(' ').toLowerCase();

        return haystack.includes(normalizedQuery);
      }),
    [normalizedQuery, packFilter, templates]
  );

  return (
    <Dialog open={open} onClose={onClose} title="Choose Template" className="max-w-3xl p-0 overflow-hidden">
      <div className="border-b border-outline-variant/40 bg-surface-container-low px-6 py-4">
        <SearchInput
          placeholder="Search templates"
          value={query}
          onSearch={setQuery}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPackFilter('all')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              packFilter === 'all'
                ? 'bg-secondary text-white'
                : 'bg-surface-container text-on-surface-variant'
            )}
          >
            All
          </button>
          {WORKFLOW_PACKS.map((pack) => (
            <button
              key={pack.key}
              type="button"
              onClick={() => setPackFilter(pack.key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                packFilter === pack.key
                  ? 'bg-secondary text-white'
                  : 'bg-surface-container text-on-surface-variant'
              )}
            >
              {pack.title}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[32rem] overflow-y-auto px-3 py-3">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
          All Templates
        </p>

        <div className="space-y-1">
          {filtered.map((template) => {
            const isSelected = template.key === selectedKey;
            const workflowPack = getWorkflowPackByTemplateKey(template.key);

            return (
              <button
                key={template.key}
                type="button"
                onClick={() => onSelect(template)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-4 text-left transition-colors',
                  isSelected
                    ? 'border-secondary bg-secondary/8'
                    : 'border-transparent hover:border-outline-variant/50 hover:bg-surface-container-low'
                )}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-on-surface">{template.name}</span>
                      {isSelected ? <Badge variant="info">Selected</Badge> : null}
                      <Badge>{formatTemplateCategoryLabel(template.category)}</Badge>
                      {template.specialty ? <Badge>{template.specialty}</Badge> : null}
                      <Badge variant={template.source === 'clinic' ? 'warning' : 'default'}>
                        {template.visibilityLabel}
                      </Badge>
                      {workflowPack ? <Badge variant="warning">{workflowPack.title}</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">{template.description}</p>
                    {workflowPack ? (
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {workflowPack.description}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.sections.slice(0, 4).map((section) => (
                        <span
                          key={section}
                          className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs text-on-surface-variant"
                        >
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-on-surface-variant">
            No templates matched your search.
          </div>
        ) : null}
      </div>

      <div className="flex justify-end border-t border-outline-variant/40 bg-surface-container-low px-6 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
