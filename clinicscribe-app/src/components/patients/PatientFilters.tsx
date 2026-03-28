'use client';

import { SearchInput } from '@/components/ui/SearchInput';

interface PatientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  consentFilter: string;
  onConsentFilterChange: (value: string) => void;
}

const consentOptions = [
  { label: 'All', value: 'all' },
  { label: 'Granted', value: 'granted' },
  { label: 'Pending', value: 'pending' },
  { label: 'Revoked', value: 'revoked' },
];

export function PatientFilters({ search, onSearchChange, consentFilter, onConsentFilterChange }: PatientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <SearchInput
        placeholder="Search patients..."
        value={search}
        onSearch={onSearchChange}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
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
    </div>
  );
}
