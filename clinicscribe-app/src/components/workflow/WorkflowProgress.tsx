'use client';

import { cn } from '@/lib/utils';
import type { ConsultationStatus } from '@/lib/types';
import { CheckCircle2, ClipboardList, ListChecks, Mic, ShieldCheck } from 'lucide-react';

type WorkflowStage = 'prepare' | 'capture' | 'verify' | 'close';

const STAGES: {
  id: WorkflowStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'prepare', label: 'Prepare', icon: ClipboardList },
  { id: 'capture', label: 'Capture', icon: Mic },
  { id: 'verify', label: 'Verify', icon: ShieldCheck },
  { id: 'close', label: 'Close', icon: ListChecks },
];

const STATUS_TO_STAGE: Record<ConsultationStatus, WorkflowStage> = {
  scheduled: 'prepare',
  brief_ready: 'prepare',
  recording: 'capture',
  transcribing: 'capture',
  generating: 'verify',
  review_pending: 'verify',
  approved: 'close',
  closeout_pending: 'close',
  closed: 'close',
  exported: 'close',
};

const COMPLETED_STAGES: Record<ConsultationStatus, WorkflowStage[]> = {
  scheduled: [],
  brief_ready: ['prepare'],
  recording: ['prepare'],
  transcribing: ['prepare', 'capture'],
  generating: ['prepare', 'capture'],
  review_pending: ['prepare', 'capture'],
  approved: ['prepare', 'capture', 'verify'],
  closeout_pending: ['prepare', 'capture', 'verify'],
  closed: ['prepare', 'capture', 'verify', 'close'],
  exported: ['prepare', 'capture', 'verify', 'close'],
};

interface WorkflowProgressProps {
  status: ConsultationStatus;
  className?: string;
}

export function WorkflowProgress({ status, className }: WorkflowProgressProps) {
  const activeStage = STATUS_TO_STAGE[status];
  const completedStages = new Set(COMPLETED_STAGES[status]);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {STAGES.map((stage, i) => {
        const isCompleted = completedStages.has(stage.id);
        const isActive = stage.id === activeStage && !isCompleted;
        const Icon = isCompleted ? CheckCircle2 : stage.icon;

        return (
          <div key={stage.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isCompleted
                  ? 'bg-success/10 text-success'
                  : isActive
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-surface-container-low text-on-surface-variant'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {stage.label}
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={cn(
                  'w-6 h-px mx-0.5',
                  completedStages.has(STAGES[i + 1].id) || (isCompleted && STAGES[i + 1].id === activeStage)
                    ? 'bg-success'
                    : 'bg-outline-variant/30'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
