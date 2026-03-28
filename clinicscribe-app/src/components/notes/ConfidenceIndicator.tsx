import { cn } from '@/lib/utils';
import { getConfidenceLevel } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  score: number;
  showLabel?: boolean;
}

const colors = {
  high: 'bg-success text-success',
  medium: 'bg-warning text-warning',
  low: 'bg-error text-error',
};

const bgColors = {
  high: 'bg-success/10',
  medium: 'bg-warning/10',
  low: 'bg-error/10',
};

export function ConfidenceIndicator({ score, showLabel = true }: ConfidenceIndicatorProps) {
  const level = getConfidenceLevel(score);
  const percentage = Math.round(score * 100);

  return (
    <div className={cn('inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold', bgColors[level])}>
      {level === 'low' && <AlertTriangle className="w-3.5 h-3.5" />}
      <div className="flex items-center gap-1.5">
        <div className="w-12 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div className={cn('h-full rounded-full', colors[level].split(' ')[0])} style={{ width: `${percentage}%` }} />
        </div>
        {showLabel && <span className={colors[level].split(' ')[1]}>{percentage}%</span>}
      </div>
    </div>
  );
}
