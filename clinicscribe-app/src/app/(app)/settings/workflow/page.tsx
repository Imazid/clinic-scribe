'use client';

import { FileText, ListChecks, Sliders } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useNoteReviewLayout } from '@/lib/hooks/useNoteReviewLayout';

/**
 * Workflow preferences — extracted from the legacy /settings overview page
 * so it lives in its own URL. The note-review layout choice is persisted
 * per-device via the existing `useNoteReviewLayout` hook.
 */
export default function SettingsWorkflowPage() {
  const { layout, setLayout, ready } = useNoteReviewLayout();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-outline-variant/40 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[15px] font-bold">Note review layout</p>
            <p className="text-[12px] text-on-surface-variant">
              How pending notes surface from the dashboard and inbox.
            </p>
          </div>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
          {[
            {
              id: 'single' as const,
              icon: FileText,
              title: 'Direct review (default)',
              body: 'Clicking a pending note opens the full review page directly.',
            },
            {
              id: 'queue' as const,
              icon: ListChecks,
              title: 'Verify queue index',
              body: 'A /notes/queue index lists every pending note as a roomy verify card; clicking opens the same review.',
            },
          ].map((option) => {
            const active = layout === option.id;
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setLayout(option.id)}
                disabled={!ready}
                className={
                  'flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition-colors disabled:opacity-50 ' +
                  (active
                    ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40')
                }
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Icon className="h-4 w-4" />
                  </div>
                  {active && <Badge variant="info">Active</Badge>}
                </div>
                <p className="text-[14px] font-semibold">{option.title}</p>
                <p className="text-[12px] leading-relaxed text-on-surface-variant">{option.body}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <p className="text-[11px] text-outline">
        Stored on this device. Cross-device sync ships with the next backend rollout.
      </p>
    </div>
  );
}
