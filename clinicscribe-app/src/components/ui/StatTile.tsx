import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTileTone = 'default' | 'warning' | 'error' | 'success' | 'info';

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sub?: string;
  tone?: StatTileTone;
  className?: string;
}

const toneStyles: Record<StatTileTone, { icon: string }> = {
  default: { icon: 'text-secondary' },
  warning: { icon: 'text-warning' },
  error: { icon: 'text-error' },
  success: { icon: 'text-success' },
  info: { icon: 'text-secondary' },
};

/**
 * StatTile — a single key/value tile used inside `<HeroStrip>` and reusable on
 * Verify, Analytics, and other dashboard-style pages. Matches the design
 * package's stat row pattern: tinted icon square (left) + uppercase eyebrow +
 * large value + small mute sub.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'default',
  className,
}: StatTileProps) {
  const t = toneStyles[tone];
  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3.5',
        className,
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
        <Icon className={cn('h-[17px] w-[17px]', t.icon)} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-outline">
          {label}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <div className="text-[22px] font-bold tracking-[-0.02em] text-on-surface">
            {value}
          </div>
          {sub && <div className="text-[11px] text-outline">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
