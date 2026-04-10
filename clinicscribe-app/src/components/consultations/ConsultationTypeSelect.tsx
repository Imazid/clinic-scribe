'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Stethoscope,
  Video,
  RotateCcw,
  Syringe,
  Brain,
  HeartPulse,
  ClipboardCheck,
} from 'lucide-react';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { CONSULTATION_TYPE_OPTIONS } from '@/lib/constants';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  Video,
  RotateCcw,
  Syringe,
  Brain,
  HeartPulse,
  ClipboardCheck,
};

interface ConsultationTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConsultationTypeSelect({
  value,
  onChange,
}: ConsultationTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    wrapperRef,
    useCallback(() => setIsOpen(false), []),
  );

  const selected = CONSULTATION_TYPE_OPTIONS.find((o) => o.value === value);
  const SelectedIcon = selected ? icons[selected.icon] : null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
      >
        {SelectedIcon && (
          <SelectedIcon className="w-3.5 h-3.5 text-secondary" />
        )}
        <span className="font-medium">{selected?.label ?? value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-20 mt-1 w-64 rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient overflow-hidden"
          >
            {CONSULTATION_TYPE_OPTIONS.map((option) => {
              const Icon = icons[option.icon];
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-secondary/8 text-secondary'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}
                    />
                  )}
                  <span className={isActive ? 'font-medium' : ''}>
                    {option.label}
                  </span>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 ml-auto text-secondary" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
