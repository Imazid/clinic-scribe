'use client';

import { useEffect, useState } from 'react';
import { HeroStrip, HeroAccent, type HeroStripStat } from '@/components/ui/HeroStrip';
import { Card, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { WeeklyTrendChart } from '@/components/analytics/WeeklyTrendChart';
import { ConsultationsByTypeChart } from '@/components/analytics/ConsultationsByTypeChart';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3,
  Clock,
  FileCheck,
  Gauge,
  Newspaper,
  TrendingUp,
} from 'lucide-react';

interface AnalyticsStats {
  totalConsultations: number;
  approvedNotes: number;
  avgConfidence: number;
  consultationsByType: { type: string; count: number }[];
  weeklyTrend: { week: string; count: number }[];
  avgTimeToApprovalHours: number | null;
  notesPerDay: number | null;
  qaFindingRate: number | null;
}

function formatWeekLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

export default function AnalyticsPage() {
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalConsultations: 0,
    approvedNotes: 0,
    avgConfidence: 0,
    consultationsByType: [],
    weeklyTrend: [],
    avgTimeToApprovalHours: null,
    notesPerDay: null,
    qaFindingRate: null,
  });

  useEffect(() => {
    async function load() {
      if (!clinicId) return;
      try {
        const supabase = createClient();
        const approvedStatuses = ['approved', 'closeout_pending', 'closed', 'exported'];

        // Parallel queries
        const [totalRes, approvedRes, allConsultationsRes, notesRes] = await Promise.all([
          supabase
            .from('consultations')
            .select('id, consultation_type', { count: 'exact' })
            .eq('clinic_id', clinicId),
          supabase
            .from('consultations')
            .select('id', { count: 'exact' })
            .eq('clinic_id', clinicId)
            .in('status', approvedStatuses),
          supabase
            .from('consultations')
            .select('id, consultation_type, status, started_at, completed_at, created_at')
            .eq('clinic_id', clinicId),
          supabase
            .from('clinical_notes')
            .select('id, confidence_scores, qa_findings, consultation_id')
            .eq('clinic_id', clinicId),
        ]);

        const allConsultations = allConsultationsRes.data || [];
        const notes = notesRes.data || [];

        // Consultations by type
        const typeMap: Record<string, number> = {};
        (totalRes.data || []).forEach((c) => {
          const t = c.consultation_type || 'Unknown';
          typeMap[t] = (typeMap[t] || 0) + 1;
        });

        // Avg confidence from clinical notes
        let avgConfidence = 0;
        const confidenceValues = notes
          .map((n) => {
            const scores = n.confidence_scores as Record<string, number> | null;
            return scores?.overall ?? null;
          })
          .filter((v): v is number => v !== null && v > 0);
        if (confidenceValues.length > 0) {
          avgConfidence =
            confidenceValues.reduce((sum, v) => sum + v, 0) / confidenceValues.length;
        }

        // Weekly trend (last 8 weeks)
        const now = new Date();
        const eightWeeksAgo = new Date(now);
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        const weekBuckets = new Map<string, number>();
        for (let i = 0; i < 8; i++) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (7 - now.getDay()) - i * 7);
          weekStart.setHours(0, 0, 0, 0);
          const key = weekStart.toISOString().slice(0, 10);
          weekBuckets.set(key, 0);
        }
        for (const c of allConsultations) {
          const created = new Date(c.created_at);
          if (created < eightWeeksAgo) continue;
          const weekStart = new Date(created);
          weekStart.setDate(created.getDate() - created.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const key = weekStart.toISOString().slice(0, 10);
          weekBuckets.set(key, (weekBuckets.get(key) || 0) + 1);
        }
        const weeklyTrend = Array.from(weekBuckets.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([week, count]) => ({ week: formatWeekLabel(week), count }));

        // Documentation efficiency: avg time to approval
        const approvedConsultations = allConsultations.filter(
          (c) => approvedStatuses.includes(c.status) && c.started_at && c.completed_at
        );
        let avgTimeToApprovalHours: number | null = null;
        if (approvedConsultations.length > 0) {
          const totalHours = approvedConsultations.reduce((sum, c) => {
            const start = new Date(c.started_at).getTime();
            const end = new Date(c.completed_at!).getTime();
            return sum + (end - start) / (1000 * 60 * 60);
          }, 0);
          avgTimeToApprovalHours = totalHours / approvedConsultations.length;
        }

        // Notes per day (last 7 days)
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentApproved = allConsultations.filter(
          (c) =>
            approvedStatuses.includes(c.status) &&
            c.completed_at &&
            new Date(c.completed_at) >= sevenDaysAgo
        );
        const notesPerDay = recentApproved.length / 7;

        // QA finding rate
        let qaFindingRate: number | null = null;
        if (notes.length > 0) {
          const withFindings = notes.filter((n) => {
            const findings = n.qa_findings as unknown[];
            return Array.isArray(findings) && findings.length > 0;
          }).length;
          qaFindingRate = withFindings / notes.length;
        }

        setStats({
          totalConsultations: totalRes.count || 0,
          approvedNotes: approvedRes.count || 0,
          avgConfidence,
          consultationsByType: Object.entries(typeMap).map(([type, count]) => ({
            type,
            count,
          })),
          weeklyTrend,
          avgTimeToApprovalHours,
          notesPerDay,
          qaFindingRate,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton variant="rectangular" className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" className="h-72 w-full rounded-2xl" />
          <Skeleton variant="rectangular" className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const approvalRate =
    stats.totalConsultations > 0
      ? Math.round((stats.approvedNotes / stats.totalConsultations) * 100)
      : null;

  const heroStats: HeroStripStat[] = [
    {
      label: 'Total consultations',
      value: stats.totalConsultations,
      sub: 'All-time',
      icon: BarChart3,
      tone: 'default',
    },
    {
      label: 'Approved notes',
      value: stats.approvedNotes,
      sub: 'Signed off',
      icon: FileCheck,
      tone: 'default',
    },
    {
      label: 'Approval rate',
      value: approvalRate !== null ? `${approvalRate}%` : '—',
      sub: approvalRate !== null && approvalRate >= 80 ? 'Healthy' : 'Track',
      icon: TrendingUp,
      tone: approvalRate !== null && approvalRate >= 80 ? 'success' : 'default',
    },
    {
      label: 'Avg confidence',
      value:
        stats.avgConfidence > 0
          ? `${Math.round(stats.avgConfidence * 100)}%`
          : '—',
      sub: stats.avgConfidence >= 0.85 ? 'High' : stats.avgConfidence >= 0.6 ? 'Mid' : 'Review',
      icon: Gauge,
      tone:
        stats.avgConfidence >= 0.85
          ? 'success'
          : stats.avgConfidence >= 0.6
            ? 'warning'
            : 'default',
    },
  ];

  return (
    <div className="space-y-6">
      <HeroStrip
        eyebrow="Analytics"
        title={
          <>
            Documentation <HeroAccent>at a glance</HeroAccent>.
          </>
        }
        description="Track approval rate, AI confidence, and documentation efficiency across the clinic. Built to support clinical documentation, not replace clinician judgement."
        stats={heroStats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle className="mb-4">Weekly Trend</CardTitle>
          <WeeklyTrendChart data={stats.weeklyTrend} />
        </Card>

        <Card>
          <CardTitle className="mb-4">Consultations by Type</CardTitle>
          <ConsultationsByTypeChart data={stats.consultationsByType} />
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-6">Documentation Efficiency</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl bg-surface-container-low px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-secondary" />
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Avg Time to Approval
              </p>
            </div>
            <p className="text-2xl font-bold text-on-surface">
              {stats.avgTimeToApprovalHours !== null
                ? stats.avgTimeToApprovalHours < 1
                  ? `${Math.round(stats.avgTimeToApprovalHours * 60)}m`
                  : `${stats.avgTimeToApprovalHours.toFixed(1)}h`
                : '--'}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="h-4 w-4 text-secondary" />
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Notes / Day (7d)
              </p>
            </div>
            <p className="text-2xl font-bold text-on-surface">
              {stats.notesPerDay !== null ? stats.notesPerDay.toFixed(1) : '--'}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="h-4 w-4 text-secondary" />
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                QA Finding Rate
              </p>
            </div>
            <p className="text-2xl font-bold text-on-surface">
              {stats.qaFindingRate !== null
                ? `${Math.round(stats.qaFindingRate * 100)}%`
                : '--'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
