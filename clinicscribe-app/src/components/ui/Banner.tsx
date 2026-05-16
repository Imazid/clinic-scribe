'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X, type LucideIcon } from 'lucide-react';

/**
 * Top-of-page banner. Use for ambient state that the user should notice
 * but isn't blocking — subscription past due, verification email pending,
 * scheduled maintenance, etc. For ephemeral feedback use the Toast system.
 *
 * Pixel-faithful to the design's `Banner` component (screens-polish.jsx).
 *
 * Usage:
 *   <Banner tone="warning" title="Verification pending" body="Click the link…" />
 *   <Banner tone="error"   title="Subscription past due" cta={{ label: 'Update card', onClick }} dismissible />
 */
export type BannerTone = 'info' | 'success' | 'warning' | 'error';

interface BannerProps {
  tone?: BannerTone;
  /** Override the default icon for the tone. */
  icon?: LucideIcon;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Right-aligned primary action. */
  cta?: { label: string; onClick: () => void };
  /** Show a close X. Banner unmounts client-side on click. */
  dismissible?: boolean;
  /** Optional class hook for layout. */
  className?: string;
}

const TONE_STYLES: Record<
  BannerTone,
  {
    /** Container background. */
    container: string;
    /** Border tone. */
    border: string;
    /** Icon foreground colour class. */
    iconColor: string;
    /** Solid CTA background. */
    ctaBg: string;
  }
> = {
  info:    { container: 'bg-secondary/6', border: 'border-secondary/30', iconColor: 'text-secondary', ctaBg: 'bg-secondary' },
  success: { container: 'bg-success/8',   border: 'border-success/30',   iconColor: 'text-success',   ctaBg: 'bg-success' },
  warning: { container: 'bg-warning/10',  border: 'border-warning/30',   iconColor: 'text-warning',   ctaBg: 'bg-warning' },
  error:   { container: 'bg-error/6',     border: 'border-error/30',     iconColor: 'text-error',     ctaBg: 'bg-error' },
};

const DEFAULT_ICON: Record<BannerTone, LucideIcon> = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   ShieldAlert,
};

export function Banner({
  tone = 'info',
  icon,
  title,
  body,
  cta,
  dismissible,
  className,
}: BannerProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const styles = TONE_STYLES[tone];
  const Icon = icon ?? DEFAULT_ICON[tone];

  return (
    <div
      role="status"
      className={
        'flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 ' +
        styles.container +
        ' ' +
        styles.border +
        (className ? ' ' + className : '')
      }
    >
      <div
        className={
          'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest ' +
          styles.iconColor
        }
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-on-surface">{title}</p>
        {body && <p className="mt-0.5 text-[12px] leading-relaxed text-on-surface-variant">{body}</p>}
      </div>
      {cta && (
        <button
          type="button"
          onClick={cta.onClick}
          className={
            'inline-flex h-9 shrink-0 items-center rounded-xl px-3.5 text-[12px] font-bold text-white transition-colors ' +
            styles.ctaBg
          }
        >
          {cta.label}
        </button>
      )}
      {dismissible && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/5 hover:text-on-surface"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
