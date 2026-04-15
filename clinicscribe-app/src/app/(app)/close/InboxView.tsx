'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, ClipboardCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskComposerDialog } from '@/components/tasks/TaskComposerDialog';
import {
  CARE_TASK_CATEGORY_LABELS,
  CARE_TASK_SOURCE_LABELS,
  CARE_TASK_STATUS_LABELS,
} from '@/lib/constants';
import type { CareTask, CareTaskCategory, CareTaskStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface InboxViewProps {
  tasks: CareTask[];
  onTaskComplete: (task: CareTask) => Promise<void>;
  onTaskCreated: (task: CareTask) => void;
  clinicId: string | undefined;
  ownerUserId: string | undefined;
  completingTaskId: string | null;
}

export function InboxView({
  tasks,
  onTaskComplete,
  onTaskCreated,
  clinicId,
  ownerUserId,
  completingTaskId,
}: InboxViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CareTaskStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CareTaskCategory>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'next_7_days' | 'overdue'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      if (dateFilter !== 'all') {
        if (!task.due_at) return false;
        const dueDate = new Date(task.due_at);

        if (dateFilter === 'today' && dueDate.toDateString() !== today.toDateString()) {
          return false;
        }
        if (dateFilter === 'next_7_days' && (dueDate < today || dueDate > nextWeek)) {
          return false;
        }
        if (dateFilter === 'overdue' && !(dueDate < today && task.status !== 'completed')) {
          return false;
        }
      }

      if (!normalizedQuery) return true;
      const haystack = [
        task.title,
        task.description,
        task.patient ? `${task.patient.first_name} ${task.patient.last_name}` : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [categoryFilter, dateFilter, searchQuery, statusFilter, tasks]);

  const openTasksCount = tasks.filter((task) =>
    ['open', 'in_progress'].includes(task.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          className="flex-1"
          value={searchQuery}
          onSearch={setSearchQuery}
          placeholder="Search for a task or patient"
        />
        <Select
          className="lg:w-44"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | CareTaskStatus)}
          options={[
            { label: 'Status', value: 'all' },
            ...Object.entries(CARE_TASK_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
        <Select
          className="lg:w-48"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as 'all' | CareTaskCategory)}
          options={[
            { label: 'Category', value: 'all' },
            ...Object.entries(CARE_TASK_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
        <Select
          className="lg:w-44"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value as typeof dateFilter)}
          options={[
            { label: 'Date', value: 'all' },
            { label: 'Today', value: 'today' },
            { label: 'Next 7 days', value: 'next_7_days' },
            { label: 'Overdue', value: 'overdue' },
          ]}
        />
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setCategoryFilter('all');
            setDateFilter('all');
          }}
          className="text-sm font-medium text-on-surface-variant transition hover:text-on-surface"
        >
          Reset filters
        </button>
        <Button type="button" onClick={() => setDialogOpen(true)}>
          Create task
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match these filters'}
          description={
            tasks.length === 0
              ? 'Tasks saved from note approval or manual reminders will appear here.'
              : 'Try widening the filters or create a new task.'
          }
          actionLabel="Create a new task"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-outline-variant/40 bg-surface-container-lowest shadow-ambient-sm">
          <div className="grid grid-cols-[minmax(0,2fr)_140px_160px_140px_120px] gap-4 border-b border-outline-variant/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            <span>Task</span>
            <span>Due</span>
            <span>Patient</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[minmax(0,2fr)_140px_160px_140px_120px] gap-4 border-b border-outline-variant/20 px-4 py-3 text-sm last:border-b-0"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-on-surface">{task.title}</p>
                  <Badge>{CARE_TASK_CATEGORY_LABELS[task.category]}</Badge>
                  <Badge variant="default">
                    {CARE_TASK_SOURCE_LABELS[task.source as keyof typeof CARE_TASK_SOURCE_LABELS] ??
                      task.source}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-on-surface-variant">{task.description}</p>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <CalendarClock className="h-4 w-4" />
                <span>{task.due_at ? formatDate(task.due_at) : '-'}</span>
              </div>
              <span className="truncate text-on-surface-variant">
                {task.patient ? `${task.patient.first_name} ${task.patient.last_name}` : '-'}
              </span>
              <div className="flex items-center">
                <Badge
                  variant={
                    task.status === 'completed'
                      ? 'success'
                      : task.status === 'in_progress'
                        ? 'info'
                        : 'default'
                  }
                >
                  {CARE_TASK_STATUS_LABELS[task.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-end gap-2">
                {task.consultation_id ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/consultations/${task.consultation_id}/review`)
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
                {task.status !== 'completed' ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onTaskComplete(task)}
                    isLoading={completingTaskId === task.id}
                  >
                    Complete
                  </Button>
                ) : (
                  <span className="text-sm text-on-surface-variant">Done</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-on-surface-variant">
        {openTasksCount} open task{openTasksCount === 1 ? '' : 's'} across the clinic
      </div>

      <TaskComposerDialog
        open={dialogOpen}
        clinicId={clinicId}
        ownerUserId={ownerUserId}
        onClose={() => setDialogOpen(false)}
        onCreated={(task) => {
          onTaskCreated(task);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
