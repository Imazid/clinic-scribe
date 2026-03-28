'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentConsultations } from '@/components/dashboard/RecentConsultations';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import type { DashboardMetrics, Consultation } from '@/lib/types';
import { Plus, Users, Stethoscope, Clock, FileCheck } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPatients: 0, consultationsThisWeek: 0, avgDocumentationTimeSeconds: 0, pendingReviews: 0,
  });
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();
      if (!profile?.clinic_id) return;

      const [patientsRes, consultationsRes, pendingRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', profile.clinic_id),
        supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('clinic_id', profile.clinic_id)
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('clinic_id', profile.clinic_id)
          .eq('status', 'review_pending'),
      ]);

      setMetrics({
        totalPatients: patientsRes.count || 0,
        consultationsThisWeek: consultationsRes.count || 0,
        avgDocumentationTimeSeconds: 0,
        pendingReviews: pendingRes.count || 0,
      });

      const { data: recent } = await supabase
        .from('consultations')
        .select('*, patient:patients(*), clinician:profiles(*)')
        .eq('clinic_id', profile.clinic_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recent) setRecentConsultations(recent as Consultation[]);
    }
    loadDashboard();
  }, [profile?.clinic_id]);

  return (
    <div>
      <PageHeader
        title={`Good ${getGreeting()}, ${profile?.first_name || 'Doctor'}`}
        description="Here's an overview of your practice today."
        actions={
          <Button onClick={() => router.push('/consultations/new')}>
            <Plus className="w-4 h-4" /> New Consultation
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={Users} label="Total Patients" value={metrics.totalPatients} />
        <MetricCard icon={Stethoscope} label="This Week" value={metrics.consultationsThisWeek} />
        <MetricCard icon={Clock} label="Avg. Doc Time" value={metrics.avgDocumentationTimeSeconds ? `${Math.round(metrics.avgDocumentationTimeSeconds / 60)}m` : '--'} />
        <MetricCard icon={FileCheck} label="Pending Reviews" value={metrics.pendingReviews} variant={metrics.pendingReviews > 0 ? 'warning' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentConsultations consultations={recentConsultations} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
