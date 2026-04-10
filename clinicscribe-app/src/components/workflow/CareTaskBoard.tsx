'use client';

import { useState, useMemo } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CARE_TASK_STATUS_LABELS } from '@/lib/constants';
import type { CareTask, CareTaskCategory, CareTaskStatus } from '@/lib/types';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  FlaskConical,
  ListChecks,
  Pill,
  Send,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CareTaskBoardProps {
  tasks: CareTask[];
  onComplete?: (task: CareTask) => void;
  completingTaskId?: string | null;
}

const CATEGORY_CONFIG: Record<CareTaskCategory, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  follow_up: { icon: ListChecks, label: 'Follow-up' },
  result_check: { icon: FlaskConical, label: 'Result' },
  referral: { icon: Send, label: 'Referral' },
  medication_review: { icon: Pill, label: 'Medication' },
  patient_education: { icon: Users, label: 'Education' },
};

const COLUMNS: { status: CareTaskStatus; label: string; emptyLabel: string }[] = [
  { status: 'open', label: 'Open', emptyLabel: 'No open tasks' },
  { status: 'in_progress', label: 'In Progress', emptyLabel: 'Nothing in progress' },
  { status: 'completed', label: 'Completed', emptyLabel: 'No completed tasks' },
];

function getDueStatus(task: CareTask): 'overdue' | 'soon' | 'future' | null {
  if (!task.due_at) return null;
  const due = new Date(task.due_at);
  const now = new Date();
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilDue < 0) return 'overdue';
  if (hoursUntilDue < 48) return 'soon';
  return 'future';
}

function TaskCard({
  task,
  onComplete,
  completingTaskId,
}: {
  task: CareTask;
  onComplete?: (task: CareTask) => void;
  completingTaskId?: string | null;
}) {
  const dueStatus = getDueStatus(task);
  const categoryConfig = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.follow_up;
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3 transition-all hover:shadow-ambient-sm',
        dueStatus === 'overdue' ? 'bg-error/5 ring-1 ring-error/20' :
        dueStatus === 'soon' ? 'bg-warning/5 ring-1 ring-warning/20' :
        'bg-surface-container-lowest'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-on-surface">{task.title}</p>
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded">
              <CategoryIcon className="w-3 h-3" />
              {categoryConfig.label}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-on-surface-variant line-clamp-2">{task.description}</p>
          )}
          {task.due_at && (
            <p className={cn(
              'text-xs mt-2 flex items-center gap-1',
              dueStatus === 'overdue' ? 'text-error font-medium' :
              dueStatus === 'soon' ? 'text-warning' : 'text-on-surface-variant'
            )}>
              {dueStatus === 'overdue' && <AlertTriangle className="w-3 h-3" />}
              <CalendarClock className="w-3.5 h-3.5" />
              {dueStatus === 'overdue' ? 'Overdue · ' : ''}
              Due {new Date(task.due_at).toLocaleDateString('en-AU')}
            </p>
          )}
        </div>
        {onComplete && task.status !== 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete(task)}
            isLoading={completingTaskId === task.id}
            className="shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function CareTaskBoard({
  tasks,
  onComplete,
  completingTaskId,
}: CareTaskBoardProps) {
  const [categoryFilter, setCategoryFilter] = useState<CareTaskCategory | 'all'>('all');

  const filteredTasks = useMemo(() => {
    if (categoryFilter === 'all') return tasks;
    return tasks.filter((t) => t.category === categoryFilter);
  }, [tasks, categoryFilter]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return Array.from(cats) as CareTaskCategory[];
  }, [tasks]);

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header with progress */}
      <div className="px-5 py-4 border-b border-outline-variant/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <CardTitle>Care Tasks</CardTitle>
          </div>
          <span className="text-sm font-semibold text-on-surface">
            {completedCount}/{totalCount}
          </span>
        </div>
        <ProgressBar value={progressPercent} color="success" className="h-1.5" />

        {/* Category filters */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-3">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={cn(
                'text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors',
                categoryFilter === 'all'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              <Filter className="w-3 h-3" /> All
            </button>
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors',
                    categoryFilter === cat
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  )}
                >
                  <Icon className="w-3 h-3" /> {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-on-surface-variant">
          No workflow tasks have been materialized yet.
        </div>
      ) : (
        /* Kanban columns */
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/20">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="min-h-[200px]">
                {/* Column header */}
                <div className="px-4 py-2.5 bg-surface-container-low flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {col.label}
                  </span>
                  <Badge variant={col.status === 'completed' ? 'success' : 'default'}>
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Column tasks */}
                <div className="p-3 space-y-2">
                  {columnTasks.length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-4">{col.emptyLabel}</p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={onComplete}
                        completingTaskId={completingTaskId}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
