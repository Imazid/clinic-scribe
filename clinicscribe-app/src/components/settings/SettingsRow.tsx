'use client';

import type { LucideIcon } from 'lucide-react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  /** Right-side content: <Toggle>, <Button>, value text, etc. */
  control?: React.ReactNode;
  /** Renders a lock icon next to the label. */
  locked?: boolean;
  /** Renders a 'Required' chip next to the label. */
  required?: boolean;
  /** Red-tinted icon tile + label for destructive actions. */
  danger?: boolean;
  /** Drop the bottom border on the last row of a section. */
  last?: boolean;
  className?: string;
}

export function SettingsRow({
  icon: Icon,
  label,
  description,
  control,
  locked,
  required,
  danger,
  last,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-6 py-4',
        !last && 'border-b border-outline-variant/40',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
            danger
              ? 'bg-error/10 text-error'
              : 'bg-surface-container-low text-secondary',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[13px] font-semibold',
              danger ? 'text-error' : 'text-on-surface',
            )}
          >
            {label}
          </span>
          {locked && <Lock className="h-3 w-3 text-outline" />}
          {required && (
            <span className="rounded-full bg-warning-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
              Required
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-[12px] leading-[1.5] text-on-surface-variant">{description}</p>
        )}
      </div>
      {control && <div className="shrink-0">{control}</div>}
    </div>
  );
}

export function SettingsSection({
  eyebrow,
  title,
  description,
  children,
  trailing,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-ambient-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/60 px-6 py-4">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <p className={cn(eyebrow && 'mt-1', 'text-[15px] font-semibold text-on-surface')}>
            {title}
          </p>
          {description && (
            <p className="mt-1 text-[12px] text-on-surface-variant">{description}</p>
          )}
        </div>
        {trailing}
      </div>
      {children}
    </section>
  );
}
