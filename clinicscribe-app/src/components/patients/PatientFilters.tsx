'use client';

import { SearchInput } from '@/components/ui/SearchInput';
import type { PatientSort } from '@/lib/hooks/usePatients';

interface PatientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  consentFilter: string;
  onConsentFilterChange: (value: string) => void;
  sort: PatientSort;
  onSortChange: (value: PatientSort) => void;
}

const consentOptions = [
  { label: 'All', value: 'all' },
  { label: 'Granted', value: 'granted' },
  { label: 'Pending', value: 'pending' },
  { label: 'Revoked', value: 'revoked' },
];

const sortOptions: { label: string; value: PatientSort }[] = [
  { label: 'Name (A–Z)', value: 'name' },
  { label: 'Most recent visit', value: 'last_visit' },
];

export function PatientFilters({
  search,
  onSearchChange,
  consentFilter,
  onConsentFilterChange,
  sort,
  onSortChange,
}: PatientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
      <SearchInput
        placeholder="Search patients..."
        value={search}
        onSearch={onSearchChange}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[14rem]"
      />
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1">
        {consentOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onConsentFilterChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              consentFilter === opt.value
                ? 'bg-surface-container-lowest text-on-surface shadow-ambient-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <span className="sr-only sm:not-sr-only">Sort</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as PatientSort)}
          className="rounded-xl bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/40"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
