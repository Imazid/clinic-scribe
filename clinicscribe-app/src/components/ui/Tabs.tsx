'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultValue, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultValue || tabs[0]?.value);

  return (
    <div className={cn('flex gap-1 bg-surface-container-low rounded-xl p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => {
            setActive(tab.value);
            onChange?.(tab.value);
          }}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            active === tab.value
              ? 'bg-surface-container-lowest text-on-surface shadow-ambient-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
