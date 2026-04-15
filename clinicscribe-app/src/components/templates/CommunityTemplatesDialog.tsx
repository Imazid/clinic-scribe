'use client';

import { useMemo, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  formatTemplateCategoryLabel,
  formatTemplateOutputLabel,
  type WorkspaceTemplate,
} from '@/lib/templates/runtime';
import { Copy, FileText } from 'lucide-react';

interface CommunityTemplatesDialogProps {
  open: boolean;
  onClose: () => void;
  templates: WorkspaceTemplate[];
  onUseTemplate: (template: WorkspaceTemplate) => Promise<void>;
}

export function CommunityTemplatesDialog({
  open,
  onClose,
  templates,
  onUseTemplate,
}: CommunityTemplatesDialogProps) {
  const [query, setQuery] = useState('');
  const [usingKey, setUsingKey] = useState<string | null>(null);

  const systemTemplates = useMemo(
    () => templates.filter((t) => t.source === 'system'),
    [templates]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return systemTemplates;
    return systemTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.specialty?.toLowerCase().includes(q) ?? false) ||
        t.description.toLowerCase().includes(q)
    );
  }, [systemTemplates, query]);

  async function handleUse(template: WorkspaceTemplate) {
    setUsingKey(template.key);
    try {
      await onUseTemplate(template);
    } finally {
      setUsingKey(null);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Community Templates" className="max-w-4xl">
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Browse curated templates and add them to your clinic library.
        </p>

        <SearchInput
          value={query}
          onSearch={setQuery}
          placeholder="Search by name, category, or specialty"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-on-surface-variant">
            No templates match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((template) => (
              <div
                key={template.key}
                className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {template.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <Badge>{formatTemplateCategoryLabel(template.category)}</Badge>
                      <Badge variant="default">
                        {formatTemplateOutputLabel(template.output_kind)}
                      </Badge>
                      {template.specialty ? (
                        <Badge variant="info">{template.specialty}</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-on-surface-variant">
                    {template.sections.length} section{template.sections.length === 1 ? '' : 's'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUse(template)}
                    isLoading={usingKey === template.key}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Use this template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
