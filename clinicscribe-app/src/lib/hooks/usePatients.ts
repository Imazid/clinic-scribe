'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getPatients } from '@/lib/api/patients';
import type { Patient } from '@/lib/types';

export type PatientSort = 'name' | 'last_visit';

export function usePatients() {
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [consentFilter, setConsentFilter] = useState('all');
  const [sort, setSort] = useState<PatientSort>('name');

  const refresh = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const data = await getPatients(clinicId, search, consentFilter);
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId, search, consentFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  // Client-side sort — list is clinic-scoped and small enough that
  // server-side ordering is overkill.
  const sortedPatients = useMemo(() => {
    const copy = [...patients];
    if (sort === 'last_visit') {
      copy.sort((a, b) => {
        const aTime = a.last_appointment_at ? new Date(a.last_appointment_at).getTime() : -Infinity;
        const bTime = b.last_appointment_at ? new Date(b.last_appointment_at).getTime() : -Infinity;
        return bTime - aTime;
      });
    } else {
      copy.sort((a, b) => {
        const left = `${a.last_name} ${a.first_name}`.toLowerCase();
        const right = `${b.last_name} ${b.first_name}`.toLowerCase();
        return left.localeCompare(right);
      });
    }
    return copy;
  }, [patients, sort]);

  return {
    patients: sortedPatients,
    loading,
    search,
    setSearch,
    consentFilter,
    setConsentFilter,
    sort,
    setSort,
    refresh,
  };
}
