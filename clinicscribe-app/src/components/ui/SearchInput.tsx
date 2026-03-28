'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
        <input
          ref={ref}
          type="search"
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
          onChange={(e) => onSearch?.(e.target.value)}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
