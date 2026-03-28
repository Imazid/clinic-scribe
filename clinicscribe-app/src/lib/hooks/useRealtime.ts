'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeConsultation(consultationId: string, onUpdate: (payload: Record<string, unknown>) => void) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`consultation-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `id=eq.${consultationId}`,
        },
        (payload) => onUpdate(payload.new as Record<string, unknown>)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId, onUpdate]);
}
