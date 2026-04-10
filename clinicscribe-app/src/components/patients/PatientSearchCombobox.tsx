'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { getPatients } from '@/lib/api/patients';
import { cn } from '@/lib/utils';
import type { Patient } from '@/lib/types';

interface PatientSearchComboboxProps {
  clinicId: string | undefined;
  onSelect: (patient: Patient) => void;
  className?: string;
}

export function PatientSearchCombobox({
  clinicId,
  onSelect,
  className,
}: PatientSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(
    wrapperRef,
    useCallback(() => setIsOpen(false), []),
  );

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || !clinicId) {
      setResults([]);
      setError(null);
      if (!debouncedQuery) setIsOpen(false);
      return;
    }

    let cancelled = false;

    async function search() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPatients(clinicId!, debouncedQuery);
        if (!cancelled) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[PatientSearch]', err);
          setError('Search failed. Try again.');
          setResults([]);
          setIsOpen(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery, clinicId]);

  function handleSelect(patient: Patient) {
    onSelect(patient);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  const quickAddName = query.trim();

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search patient..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          className="w-48 pl-9 pr-4 py-1.5 rounded-full bg-surface-container text-sm text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-20 mt-1 w-72 rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient overflow-hidden"
          >
            {/* Error state */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
                <button
                  onClick={() => {
                    setError(null);
                    setQuery((q) => q + ' ');
                    setTimeout(() => setQuery((q) => q.trim()), 10);
                  }}
                  className="ml-auto text-xs font-medium text-secondary hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && !error && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-on-surface-variant">
                <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                Searching...
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && results.length > 0 && (
              <div>
                {results.slice(0, 5).map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelect(patient)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container-low transition-colors"
                  >
                    <span className="font-medium text-on-surface">
                      {patient.first_name} {patient.last_name}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {patient.mrn || ''}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && results.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-on-surface-variant">
                  No patients found
                </p>
                {quickAddName && (
                  <a
                    href={`/patients/new?name=${encodeURIComponent(quickAddName)}&returnTo=/consultations/new`}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add &ldquo;{quickAddName}&rdquo;
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
