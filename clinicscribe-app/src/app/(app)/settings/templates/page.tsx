'use client';

import Link from 'next/link';
import { Sliders, FileText, ListChecks, ExternalLink, LayoutTemplate } from 'lucide-react';
import { SettingsSection, SettingsRow } from '@/components/settings/SettingsRow';
import { Badge } from '@/components/ui/Badge';
import { useNoteReviewLayout } from '@/lib/hooks/useNoteReviewLayout';
import { useWorkspaceTemplates } from '@/lib/hooks/useWorkspaceTemplates';

export default function SettingsTemplatesPage() {
  const { layout, setLayout, ready } = useNoteReviewLayout();
  const { templates, defaultTemplate } = useWorkspaceTemplates();

  return (
    <div className="space-y-6">
      <SettingsSection
        eyebrow="House style"
        title="Default note template"
        description="Used when starting a session without picking a template."
        trailing={
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-secondary hover:underline"
          >
            Manage library
            <ExternalLink className="h-3 w-3" />
          </Link>
        }
      >
        <SettingsRow
          icon={LayoutTemplate}
          label={defaultTemplate?.name ?? 'No default set'}
          description={defaultTemplate?.description ?? 'Pick a default in the templates library.'}
          control={
            <span className="rounded-full bg-secondary-fixed px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
              {templates.length} in library
            </span>
          }
          last
        />
      </SettingsSection>

      <SettingsSection
        eyebrow="Workflow"
        title="Note review layout"
        description="How pending notes surface from the dashboard and inbox."
      >
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {(
            [
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
                body: 'A queue page lists every pending note; clicking opens the same review screen.',
              },
            ] as const
          ).map((option) => {
            const active = layout === option.id;
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setLayout(option.id)}
                disabled={!ready}
                className={
                  'flex flex-col items-start gap-2 rounded-2xl border-[1.5px] px-4 py-4 text-left transition-colors disabled:opacity-50 ' +
                  (active
                    ? 'border-secondary bg-secondary-fixed'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-secondary/40')
                }
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Icon className="h-4 w-4" />
                  </div>
                  {active && <Badge variant="info">Active</Badge>}
                </div>
                <p className="text-[14px] font-semibold text-on-surface">{option.title}</p>
                <p className="text-[12px] leading-relaxed text-on-surface-variant">{option.body}</p>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        eyebrow="Preferences"
        title="Drafting defaults"
        description="Coming soon: section-by-section toggles for what Miraa drafts unprompted."
      >
        <SettingsRow
          icon={Sliders}
          label="Include differential diagnosis"
          description="Add a short DDx list under Assessment when the transcript supports it."
          control={<Badge variant="default">Coming soon</Badge>}
          last
        />
      </SettingsSection>

      <p className="text-[11px] text-outline">
        Layout choice stored on this device. Cross-device sync ships with the next backend rollout.
      </p>
    </div>
  );
}
