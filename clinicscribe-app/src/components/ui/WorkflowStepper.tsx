'use client';

import { ClipboardList, Mic, ShieldCheck, CheckCircle2, FileCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkflowStep = 'prepare' | 'capture' | 'verify' | 'approve' | 'close';

interface WorkflowStepperProps {
  active: WorkflowStep;
  /** Steps the user has already completed (rendered as solid). */
  completed?: WorkflowStep[];
  /** Steps the user can't navigate to yet (rendered dim, no click handler). */
  disabled?: WorkflowStep[];
  onStep?: (step: WorkflowStep) => void;
  className?: string;
}

interface StepDef {
  id: WorkflowStep;
  label: string;
  icon: LucideIcon;
}

const STEPS: StepDef[] = [
  { id: 'prepare', label: 'Prepare', icon: ClipboardList },
  { id: 'capture', label: 'Capture', icon: Mic },
  { id: 'verify', label: 'Verify', icon: ShieldCheck },
  { id: 'approve', label: 'Approve', icon: FileCheck },
  { id: 'close', label: 'Close', icon: CheckCircle2 },
];

/**
 * WorkflowStepper — horizontal Prepare → Capture → Verify → Approve → Close
 * stepper that anchors every consultation-flow screen.
 *
 * Visual states (left to right):
 *   - completed (solid secondary fill, white check)
 *   - active    (filled primary, on-primary text, scale up)
 *   - upcoming  (outline + muted)
 *   - disabled  (dim, not clickable)
 */
export function WorkflowStepper({
  active,
  completed = [],
  disabled = [],
  onStep,
  className,
}: WorkflowStepperProps) {
  const activeIndex = STEPS.findIndex((s) => s.id === active);
  const completedSet = new Set(completed);
  const disabledSet = new Set(disabled);

  return (
    <nav
      aria-label="Consultation workflow"
      className={cn(
        'flex items-center gap-1 overflow-x-auto rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-1.5 shadow-ambient-sm',
        className,
      )}
    >
      {STEPS.map((step, i) => {
        const isActive = step.id === active;
        const isComplete = completedSet.has(step.id) || (!isActive && i < activeIndex);
        const isDisabled = disabledSet.has(step.id);
        const Icon = step.icon;
        const Tag = isDisabled || !onStep ? 'div' : 'button';

        return (
          <div key={step.id} className="flex shrink-0 items-center">
            <Tag
              type={Tag === 'button' ? 'button' : undefined}
              onClick={!isDisabled && onStep ? () => onStep(step.id) : undefined}
              disabled={Tag === 'button' ? isDisabled : undefined}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'group relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
                isActive &&
                  'bg-primary text-on-primary shadow-ambient-sm scale-[1.02]',
                !isActive &&
                  isComplete &&
                  'bg-secondary/10 text-secondary hover:bg-secondary/15',
                !isActive &&
                  !isComplete &&
                  !isDisabled &&
                  'text-on-surface-variant hover:bg-surface-container-low',
                isDisabled && 'cursor-not-allowed text-outline opacity-50',
                Tag === 'button' &&
                  !isDisabled &&
                  'cursor-pointer hover:-translate-y-px',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg',
                  isActive && 'bg-on-primary/15',
                  !isActive && isComplete && 'bg-secondary text-white',
                  !isActive && !isComplete && 'bg-surface-container',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
              <span
                className={cn(
                  'hidden font-mono text-[10px] tabular-nums sm:inline',
                  isActive ? 'text-on-primary/60' : 'text-outline',
                )}
              >
                0{i + 1}
              </span>
            </Tag>
            {i < STEPS.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  'mx-1 h-px w-4 shrink-0 sm:w-6',
                  i < activeIndex ? 'bg-secondary/40' : 'bg-outline-variant',
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
