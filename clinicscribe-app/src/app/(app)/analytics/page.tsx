'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, Clock, FileCheck, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    approvedNotes: 0,
    avgConfidence: 0,
    consultationsByType: [] as { type: string; count: number }[],
    weeklyTrend: [] as { week: string; count: number }[],
  });

  useEffect(() => {
    async function load() {
      if (!clinicId) return;
      const supabase = createClient();

      const [totalRes, approvedRes] = await Promise.all([
        supabase.from('consultations').select('id, consultation_type', { count: 'exact' }).eq('clinic_id', clinicId),
        supabase.from('consultations').select('id', { count: 'exact' }).eq('clinic_id', clinicId).eq('status', 'approved'),
      ]);

      // Group by type
      const typeMap: Record<string, number> = {};
      (totalRes.data || []).forEach((c) => {
        const t = c.consultation_type || 'Unknown';
        typeMap[t] = (typeMap[t] || 0) + 1;
      });

      setStats({
        totalConsultations: totalRes.count || 0,
        approvedNotes: approvedRes.count || 0,
        avgConfidence: 0,
        consultationsByType: Object.entries(typeMap).map(([type, count]) => ({ type, count })),
        weeklyTrend: [],
      });
    }
    load();
  }, [clinicId]);

  return (
    <div>
      <PageHeader title="Analytics" description="Track documentation performance and clinical insights." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={BarChart3} label="Total Consultations" value={stats.totalConsultations} />
        <MetricCard icon={FileCheck} label="Approved Notes" value={stats.approvedNotes} />
        <MetricCard icon={TrendingUp} label="Approval Rate" value={stats.totalConsultations > 0 ? `${Math.round((stats.approvedNotes / stats.totalConsultations) * 100)}%` : '--'} />
        <MetricCard icon={Clock} label="Avg Confidence" value={stats.avgConfidence > 0 ? `${Math.round(stats.avgConfidence * 100)}%` : '--'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle className="mb-4">Consultations by Type</CardTitle>
          {stats.consultationsByType.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.consultationsByType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">{item.type}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${(item.count / stats.totalConsultations) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-on-surface w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Documentation Efficiency</CardTitle>
          <div className="text-center py-12 text-sm text-on-surface-variant">
            Efficiency metrics will appear after more consultations are processed.
          </div>
        </Card>
      </div>
    </div>
  );
}
