'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-ambient-lg animate-fade-in-up',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high transition-colors">
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
