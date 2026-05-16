import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { StatTile, type StatTileTone } from './StatTile';
import { cn } from '@/lib/utils';

export interface HeroStripStat {
  label: string;
  value: number | string;
  sub?: string;
  icon: LucideIcon;
  tone?: StatTileTone;
}

interface HeroStripProps {
  /** Small uppercase eyebrow above the title (e.g. "Tuesday · 5 May"). */
  eyebrow?: string;
  /** Headline. Supply `accent` to render a Fraunces-italic word inline. */
  title: ReactNode;
  /** Optional muted description sentence below the title. */
  description?: ReactNode;
  /** 1-4 stat tiles rendered as a grid below the headline. */
  stats?: HeroStripStat[];
  /** CTA buttons (renders top-right on desktop, wraps below on mobile). */
  actions?: ReactNode;
  className?: string;
}

/**
 * HeroStrip — the warm `mesh-bg` panel that anchors every primary screen
 * (Today/Dashboard, Verify, Patient profile, Analytics). Encapsulates the
 * eyebrow + headline + description + actions row, plus an optional stats grid
 * underneath.
 *
 * Pair with `<HeroAccent>` to get the editorial italic word inside the title:
 *
 *   <HeroStrip
 *     eyebrow="Tuesday · 5 May"
 *     title={<>Good morning, <HeroAccent>Ihtisham</HeroAccent>.</>}
 *     description="Six consults on the schedule…"
 *     stats={[…]}
 *     actions={<>…</>}
 *   />
 */
export function HeroStrip({
  eyebrow,
  title,
  description,
  stats,
  actions,
  className,
}: HeroStripProps) {
  const statCount = stats?.length ?? 0;
  // Tailwind needs static class names — pick the right grid template at build time.
  const gridCols =
    statCount <= 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : statCount === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-2 lg:grid-cols-4';

  return (
    <section
      className={cn(
        'mesh-bg rounded-3xl border border-outline-variant/60 bg-gradient-to-br from-surface-container-lowest to-surface-container-low px-7 py-7 md:px-8 md:py-8',
        className,
      )}
    >
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
              {eyebrow}
            </div>
          )}
          <h1 className="m-0 text-3xl font-bold tracking-[-0.02em] leading-[1.1] text-on-surface md:text-[32px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-[540px] text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className={cn('grid gap-3', gridCols)}>
          {stats.map((s, i) => (
            <StatTile
              key={`${s.label}-${i}`}
              icon={s.icon}
              label={s.label}
              value={s.value}
              sub={s.sub}
              tone={s.tone}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * HeroAccent — wraps the editorial italic word inside a hero title.
 * Renders as a slate-blue Fraunces italic span.
 */
export function HeroAccent({ children }: { children: ReactNode }) {
  return <span className="serif-italic text-secondary">{children}</span>;
}
