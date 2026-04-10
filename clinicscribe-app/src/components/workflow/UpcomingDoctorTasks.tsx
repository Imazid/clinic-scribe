'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import {
  CARE_TASK_CATEGORY_LABELS,
  CARE_TASK_SOURCE_LABELS,
} from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import type { CareTask } from '@/lib/types';
import { AlertTriangle, ArrowRight, CalendarClock, ClipboardCheck } from 'lucide-react';

interface UpcomingDoctorTasksProps {
  tasks: CareTask[];
  totalCount: number;
  className?: string;
}

function getDueState(dueAt: string | null) {
  if (!dueAt) {
    return {
      label: 'No due date',
      variant: 'default' as const,
      icon: CalendarClock,
    };
  }

  const due = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return {
      label: `Overdue · ${formatDate(dueAt)}`,
      variant: 'error' as const,
      icon: AlertTriangle,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due today',
      variant: 'warning' as const,
      icon: CalendarClock,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Due tomorrow',
      variant: 'warning' as const,
      icon: CalendarClock,
    };
  }

  return {
    label: `Due ${formatDate(dueAt)}`,
    variant: 'info' as const,
    icon: CalendarClock,
  };
}

export function UpcomingDoctorTasks({
  tasks,
  totalCount,
  className,
}: UpcomingDoctorTasksProps) {
  const router = useRouter();
  const overdueCount = tasks.filter((task) => {
    if (!task.due_at) return false;
    const due = new Date(task.due_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const dueThisWeekCount = tasks.filter((task) => {
    if (!task.due_at) return false;
    const due = new Date(task.due_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inSevenDays = new Date(today);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return due >= today && due <= inSevenDays;
  }).length;

  return (
    <Card className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <CardTitle>Upcoming Doctor Tasks</CardTitle>
            <Badge variant={totalCount > 0 ? 'info' : 'default'}>{totalCount}</Badge>
          </div>
          <CardDescription>
            Follow-up items extracted from AI-generated consult notes after transcription and approval.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/close')}>
          Open Tasks
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {totalCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant={overdueCount > 0 ? 'error' : 'default'}>
            {overdueCount} overdue
          </Badge>
          <Badge variant={dueThisWeekCount > 0 ? 'warning' : 'default'}>
            {dueThisWeekCount} due this week
          </Badge>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
          No upcoming doctor tasks yet. Once a consult note is generated, verified, and moved into tasks, the next actions will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const patient = task.patient ?? task.consultation?.patient;
            const dueState = getDueState(task.due_at);
            const DueIcon = dueState.icon;
            const categoryLabel =
              CARE_TASK_CATEGORY_LABELS[task.category] ?? task.category.replace('_', ' ');
            const sourceLabel =
              CARE_TASK_SOURCE_LABELS[
                task.source as keyof typeof CARE_TASK_SOURCE_LABELS
              ] ?? 'Workflow task';

            return (
              <div
                key={task.id}
                className="rounded-xl bg-surface-container-low px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{task.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {patient
                        ? `${patient.first_name} ${patient.last_name}`
                        : 'Patient record pending'}
                      {task.consultation?.reason_for_visit
                        ? ` · ${task.consultation.reason_for_visit}`
                        : task.consultation?.consultation_type
                          ? ` · ${task.consultation.consultation_type}`
                          : ''}
                    </p>
                  </div>
                  <Badge variant={dueState.variant}>
                    <DueIcon className="w-3.5 h-3.5 mr-1" />
                    {dueState.label}
                  </Badge>
                </div>

                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {task.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="default">{categoryLabel}</Badge>
                  <Badge variant="info">{sourceLabel}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalCount > tasks.length && (
        <p className="text-xs text-on-surface-variant">
          Showing {tasks.length} of {totalCount} upcoming doctor tasks.
        </p>
      )}
    </Card>
  );
}
