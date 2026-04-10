import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';

interface SidebarCounts {
  prepare: number;
  verify: number;
  close: number;
}

const EMPTY: SidebarCounts = { prepare: 0, verify: 0, close: 0 };
const REFRESH_INTERVAL = 30_000;

export function useSidebarCounts(): SidebarCounts {
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [counts, setCounts] = useState<SidebarCounts>(EMPTY);

  const refresh = useCallback(async () => {
    if (!clinicId) return;
    const supabase = createClient();

    try {
      const [prepareRes, verifyRes, closeRes] = await Promise.all([
        supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinicId)
          .in('status', ['scheduled']),
        supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinicId)
          .in('status', ['review_pending']),
        supabase
          .from('care_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinicId)
          .in('status', ['open', 'in_progress']),
      ]);

      setCounts({
        prepare: prepareRes.count ?? 0,
        verify: verifyRes.count ?? 0,
        close: closeRes.count ?? 0,
      });
    } catch {
      // Silently fail — sidebar badges are non-critical
    }
  }, [clinicId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return counts;
}
