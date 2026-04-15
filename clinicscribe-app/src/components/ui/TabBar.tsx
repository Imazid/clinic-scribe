'use client';

import { cn } from '@/lib/utils';

interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabBarProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: TabOption<T>[];
  className?: string;
}

export function TabBar<T extends string>({
  value,
  onChange,
  options,
  className,
}: TabBarProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex gap-1 rounded-xl bg-surface-container-low p-1',
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-surface-container-lowest text-on-surface shadow-ambient-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {opt.label}
            {opt.count !== undefined && opt.count > 0 ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  active
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                {opt.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
