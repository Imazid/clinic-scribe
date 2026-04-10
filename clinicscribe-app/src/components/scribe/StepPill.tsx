import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface StepPillProps {
  number: number;
  label: string;
  done: boolean;
  active: boolean;
}

export function StepPill({ number, label, done, active }: StepPillProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
        done
          ? 'bg-success/10 text-success'
          : active
            ? 'bg-secondary/10 text-secondary'
            : 'bg-surface-container text-on-surface-variant'
      )}
    >
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
            active ? 'bg-secondary/20' : 'bg-surface-container-high'
          )}
        >
          {number}
        </span>
      )}
      {label}
    </div>
  );
}

export function StepConnector({ done }: { done: boolean }) {
  return (
    <div
      className={cn('h-px w-8 transition-colors', done ? 'bg-success/40' : 'bg-outline-variant/30')}
    />
  );
}
