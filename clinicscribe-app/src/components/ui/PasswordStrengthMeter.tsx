'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Empty' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
}

export function scorePassword(pw: string): PasswordScore {
  const checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;

  if (pw.length === 0) return { score: 0, label: 'Empty', checks };
  if (passed <= 2) return { score: 1, label: 'Weak', checks };
  if (passed === 3) return { score: 2, label: 'Fair', checks };
  if (passed === 4) return { score: 3, label: 'Good', checks };
  return { score: 4, label: 'Strong', checks };
}

const segmentColors = [
  'bg-outline-variant', // empty
  'bg-error',           // weak
  'bg-warning',         // fair
  'bg-secondary',       // good
  'bg-primary',         // strong
];

const labelColors: Record<PasswordScore['label'], string> = {
  Empty: 'text-outline',
  Weak: 'text-error',
  Fair: 'text-warning',
  Good: 'text-secondary',
  Strong: 'text-primary',
};

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { score, label, checks } = scorePassword(password);
  const requirements: { key: keyof typeof checks; text: string }[] = [
    { key: 'length', text: 'At least 8 characters' },
    { key: 'upper', text: 'One uppercase letter' },
    { key: 'lower', text: 'One lowercase letter' },
    { key: 'number', text: 'One number' },
    { key: 'special', text: 'One special character' },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => {
          const filled = score > i;
          const color = filled ? segmentColors[score] : 'bg-outline-variant/40';
          return (
            <motion.div
              key={i}
              className={cn('h-1.5 flex-1 rounded-full origin-left', color)}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: filled ? 1 : 0.12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-variant">Password strength</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            className={cn('text-xs font-semibold', labelColors[label])}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {label === 'Empty' ? '—' : label}
          </motion.span>
        </AnimatePresence>
      </div>
      <ul className="grid grid-cols-1 gap-1 pt-1 sm:grid-cols-2">
        {requirements.map(({ key, text }) => {
          const met = checks[key];
          return (
            <li key={key} className="flex items-center gap-1.5 text-xs">
              <motion.span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full',
                  met ? 'bg-primary/15 text-primary' : 'bg-outline-variant/30 text-outline'
                )}
                initial={false}
                animate={{ scale: met ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </motion.span>
              <span className={met ? 'text-on-surface' : 'text-on-surface-variant'}>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
