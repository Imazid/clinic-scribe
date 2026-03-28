import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const colorStyles = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export function ProgressBar({ value, max = 100, className, color = 'secondary' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full h-2 bg-surface-container-high rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorStyles[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
