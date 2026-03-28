'use client';

import { useState, useEffect, useCallback } from 'react';
import { getConsultation } from '@/lib/api/consultations';
import type { Consultation } from '@/lib/types';

export function useConsultation(id: string) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConsultation(id);
      setConsultation(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consultation');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { consultation, loading, error, refresh, setConsultation };
}
