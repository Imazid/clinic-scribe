import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'feature';
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className,
  variant = 'default',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6',
        variant === 'feature' &&
          'relative overflow-hidden rounded-[2rem] border border-outline-variant/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(161,239,255,0.18)_100%)] px-6 py-6 shadow-ambient',
        className
      )}
    >
      {variant === 'feature' ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_top_right,rgba(88,230,255,0.25),transparent_70%)]" />
      ) : null}

      <div
        className={cn(
          'relative flex flex-col gap-4',
          variant === 'default' && 'sm:flex-row sm:items-center sm:justify-between',
          variant === 'feature' && 'lg:flex-row lg:items-start lg:justify-between lg:gap-8'
        )}
      >
        <div className={cn(variant === 'feature' && 'max-w-3xl')}>
          {eyebrow ? (
            <p className="label-text mb-2 text-secondary">{eyebrow}</p>
          ) : null}
          <h1
            className={cn(
              'font-bold text-on-surface',
              variant === 'default' && 'text-2xl',
              variant === 'feature' && 'text-[clamp(2rem,4vw,2.75rem)] leading-tight'
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                'text-sm text-on-surface-variant',
                variant === 'default' && 'mt-1',
                variant === 'feature' && 'mt-3 max-w-2xl text-[0.95rem] leading-6'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div
            className={cn(
              'flex items-center gap-3',
              variant === 'feature' && 'w-full lg:w-auto'
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
