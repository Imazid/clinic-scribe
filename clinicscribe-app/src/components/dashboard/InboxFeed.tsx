'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  PhoneOff,
  Sparkles,
  FileEdit,
  AlertTriangle,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type InboxItemKind = 'review' | 'follow' | 'prep' | 'draft';

export interface InboxItem {
  id: string;
  kind: InboxItemKind;
  patientFirstName: string;
  patientLastName: string;
  type: string;
  headline: string;
  body: string;
  meta: string;
  confidence?: number;
  tone: 'error' | 'warning' | 'info' | 'success' | 'default';
  href: string;
}

interface InboxFeedProps {
  items: InboxItem[];
}

const kindIcon: Record<InboxItemKind, LucideIcon> = {
  review: ShieldCheck,
  follow: PhoneOff,
  prep: Sparkles,
  draft: FileEdit,
};

const toneRing: Record<InboxItem['tone'], string> = {
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-secondary',
  success: 'bg-success',
  default: 'bg-outline-variant',
};

function ItemBadge({ item }: { item: InboxItem }) {
  if (item.kind === 'review' && item.tone === 'error') {
    return (
      <Badge variant="error" className="gap-1 text-[10px]">
        <AlertTriangle className="h-3 w-3" /> Critical
      </Badge>
    );
  }
  if (item.kind === 'review' && item.tone === 'warning') {
    return <Badge variant="warning" className="text-[10px]">Needs review</Badge>;
  }
  if (item.kind === 'review' && item.tone === 'success') {
    return <Badge variant="success" className="text-[10px]">Ready to approve</Badge>;
  }
  if (item.kind === 'follow') {
    return <Badge variant="error" className="text-[10px]">Overdue</Badge>;
  }
  if (item.kind === 'prep') {
    return <Badge variant="info" className="text-[10px]">Prep needed</Badge>;
  }
  if (item.kind === 'draft') {
    return <Badge variant="default" className="text-[10px]">Draft</Badge>;
  }
  return null;
}

function ConfidenceMini({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone = pct >= 85 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-error';
  const fill = pct >= 85 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-error';
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant">
      <Sparkles className={cn('h-3 w-3', tone)} />
      <span className={tone}>{pct}%</span>
      <div className="h-1 w-12 overflow-hidden rounded-full bg-surface-container">
        <div className={cn('h-full transition-[width] duration-500', fill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * "What needs you now" inbox feed — mixed-tone item rows that span review,
 * follow-up, prep, and draft work. Filter chips at the top let the clinician
 * narrow by category.
 */
export function InboxFeed({ items }: InboxFeedProps) {
  const counts = {
    all: items.length,
    review: items.filter((i) => i.kind === 'review').length,
    prep: items.filter((i) => i.kind === 'prep').length,
    follow: items.filter((i) => i.kind === 'follow').length,
    draft: items.filter((i) => i.kind === 'draft').length,
  };
  const [filter, setFilter] = useState<'all' | InboxItemKind>('all');
  const filters: Array<{ id: 'all' | InboxItemKind; label: string; count: number; tone?: 'error' }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'review', label: 'Pending review', count: counts.review },
    { id: 'prep', label: 'Prep needed', count: counts.prep },
    { id: 'follow', label: 'Follow-ups', count: counts.follow, tone: 'error' },
    { id: 'draft', label: 'Drafts', count: counts.draft },
  ];

  const visible = filter === 'all' ? items : items.filter((i) => i.kind === filter);

  return (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="flex flex-col gap-3.5 px-6 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="eyebrow mb-1">Inbox</div>
            <div className="text-[18px] font-bold tracking-[-0.01em] text-on-surface">
              What needs you now
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button variant="ghost" size="sm">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort
            </Button>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition-colors',
                  isActive
                    ? 'border-transparent bg-primary text-on-primary'
                    : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-secondary/30 hover:text-secondary',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-on-primary/15 text-on-primary'
                      : f.tone === 'error' && f.count > 0
                        ? 'bg-error/15 text-error'
                        : 'bg-surface-container-high text-on-surface-variant',
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="divider-h mt-3.5" />

      {visible.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-on-surface-variant">
          Nothing in this lane right now.
        </div>
      ) : (
        <div className="flex flex-col">
          {visible.map((item, i) => {
            const Icon = kindIcon[item.kind];
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group grid grid-cols-[4px_auto_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-container-low',
                  i < visible.length - 1 && 'border-b border-outline-variant/60',
                )}
              >
                <div className={cn('h-8 w-1 self-center rounded-full', toneRing[item.tone])} />
                <Avatar firstName={item.patientFirstName} lastName={item.patientLastName} size="md" />
                <div className="min-w-0">
                  <div className="mb-0.5 flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-on-surface">
                      {item.patientFirstName} {item.patientLastName}
                    </div>
                    <span className="text-xs text-outline">·</span>
                    <div className="text-xs text-on-surface-variant">{item.type}</div>
                    <ItemBadge item={item} />
                  </div>
                  <div className="text-[13px] font-medium text-on-surface">{item.headline}</div>
                  <div className="truncate text-xs text-on-surface-variant">{item.body}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-outline">
                    <Icon className="h-3 w-3" />
                    {item.meta}
                  </div>
                  {item.confidence != null && <ConfidenceMini value={item.confidence} />}
                  <ArrowRight className="h-3.5 w-3.5 text-outline transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
