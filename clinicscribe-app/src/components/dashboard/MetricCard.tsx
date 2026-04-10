import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  variant?: 'default' | 'warning' | 'error';
}

export function MetricCard({ icon: Icon, label, value, variant = 'default' }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-text text-on-surface-variant mb-2">{label}</p>
          <p className={cn(
            'text-3xl font-bold',
            variant === 'error' ? 'text-error' :
            variant === 'warning' ? 'text-warning' : 'text-on-surface'
          )}>
            {value}
          </p>
        </div>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          variant === 'error' ? 'bg-error/10' :
          variant === 'warning' ? 'bg-warning/10' : 'bg-secondary-fixed'
        )}>
          <Icon className={cn('w-5 h-5',
            variant === 'error' ? 'text-error' :
            variant === 'warning' ? 'text-warning' : 'text-secondary'
          )} />
        </div>
      </div>
    </Card>
  );
}
