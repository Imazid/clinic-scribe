'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional sticky footer (typically action buttons). Stays pinned at the
   *  bottom of the dialog regardless of body scroll position. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, footer, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient-lg animate-fade-in-up',
          className
        )}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between gap-2 px-6 pt-6 pb-4">
            <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high transition-colors shrink-0">
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        )}
        <div className={cn('overflow-y-auto', title ? 'px-6 pb-6' : 'p-6')}>
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest/95 px-6 py-4 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
