'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, Check, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CareTask } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FollowUpsTileProps {
  tasks: CareTask[];
  onComplete?: (task: CareTask) => void;
}

function dueLabel(iso: string | null): string {
  if (!iso) return 'No due date';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'No due date';
  const days = Math.floor((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < -1) return `Overdue ${Math.abs(days)}d`;
  if (days === -1) return 'Yesterday';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days}d`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

/** Open follow-up loops surfaced as a compact dashboard tile. */
export function FollowUpsTile({ tasks, onComplete }: FollowUpsTileProps) {
  // Sample "now" once per task-list change. Memoising keeps overdue badges
  // stable within a single render — sub-second freshness isn't needed for an
  // overdue badge, but we do want the value to refresh when tasks reload.
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), [tasks]);
  const overdueCount = tasks.filter(
    (t) => t.due_at && new Date(t.due_at).getTime() < now,
  ).length;

  return (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="eyebrow mb-1">Follow-ups</div>
          <div className="text-[16px] font-bold text-on-surface">Open loops</div>
        </div>
        {overdueCount > 0 ? (
          <Badge variant="error">{overdueCount} overdue</Badge>
        ) : (
          <Badge variant="default">{tasks.length} open</Badge>
        )}
      </div>
      <div className="divider-h" />
      {tasks.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-on-surface-variant">
          No open follow-ups. The loop is closed.
        </div>
      ) : (
        <div>
          {tasks.slice(0, 5).map((task, i) => {
            const overdue =
              task.due_at != null && new Date(task.due_at).getTime() < now;
            const Icon = overdue ? AlertTriangle : Clock;
            const patientName = task.patient
              ? `${task.patient.first_name} ${task.patient.last_name}`
              : 'Unknown patient';
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 px-5 py-3',
                  i < Math.min(tasks.length, 5) - 1 && 'border-b border-outline-variant/60',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    overdue
                      ? 'bg-error/10 text-error'
                      : 'bg-surface-container-low text-on-surface-variant',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-on-surface">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-outline">
                    {patientName} · {dueLabel(task.due_at)}
                  </div>
                </div>
                {onComplete && (
                  <button
                    type="button"
                    onClick={() => onComplete(task)}
                    aria-label={`Mark ${task.title} done`}
                    className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-success"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="border-t border-outline-variant/60 p-3">
        <Link
          href="/close"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          Open tasks workspace <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
