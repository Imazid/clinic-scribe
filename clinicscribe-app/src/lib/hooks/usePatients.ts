'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getPatients } from '@/lib/api/patients';
import type { Patient } from '@/lib/types';

export function usePatients() {
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [consentFilter, setConsentFilter] = useState('all');

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

  return { patients, loading, search, setSearch, consentFilter, setConsentFilter, refresh };
}
