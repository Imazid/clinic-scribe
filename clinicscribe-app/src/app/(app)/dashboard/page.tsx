'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentConsultations } from '@/components/dashboard/RecentConsultations';
import { UpcomingDoctorTasks } from '@/components/workflow/UpcomingDoctorTasks';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { getRecentConsultations } from '@/lib/api/consultations';
import { getCareTasks, getVerificationQueue } from '@/lib/api/workflow';
import type { CareTask, Consultation } from '@/lib/types';
import { BarChart3, ClipboardCheck, AlertTriangle, FileCheck } from 'lucide-react';

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const addToast = useUIStore((state) => state.addToast);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.clinic_id) return;
    setLoading(true);
    try {
      const [consultations, taskData, verifyQueue] = await Promise.all([
        getRecentConsultations(profile.clinic_id, 5),
        getCareTasks(profile.clinic_id, 'all'),
        getVerificationQueue(profile.clinic_id),
      ]);
      setRecentConsultations(consultations);
      setTasks(taskData);
      setPendingReviewCount(
        verifyQueue.filter((c) => c.status === 'review_pending').length
      );
    } catch (error) {
      console.error(error);
      addToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, profile?.clinic_id]);

  useEffect(() => {
    load();
  }, [load]);

  const openTasks = useMemo(
    () => tasks.filter((t) => ['open', 'in_progress'].includes(t.status)),
    [tasks]
  );

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return openTasks.filter((t) => t.due_at && new Date(t.due_at) < now);
  }, [openTasks]);

  const consultationsThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return recentConsultations.filter(
      (c) => new Date(c.created_at) >= startOfWeek
    ).length;
  }, [recentConsultations]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton variant="rectangular" className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.6fr] gap-6">
          <Skeleton variant="rectangular" className="h-80 w-full rounded-2xl" />
          <Skeleton variant="rectangular" className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back${profile?.first_name ? `, ${profile.first_name}` : ''}`}
        description="Your clinic at a glance — recent activity, open work, and quick actions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={BarChart3}
          label="This Week"
          value={consultationsThisWeek}
        />
        <MetricCard
          icon={FileCheck}
          label="Pending Reviews"
          value={pendingReviewCount}
          variant={pendingReviewCount > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          icon={ClipboardCheck}
          label="Open Tasks"
          value={openTasks.length}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Overdue"
          value={overdueTasks.length}
          variant={overdueTasks.length > 0 ? 'error' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.6fr] gap-6">
        <RecentConsultations consultations={recentConsultations} />
        <div className="space-y-6">
          <QuickActions />
          <UpcomingDoctorTasks
            tasks={openTasks.slice(0, 5)}
            totalCount={openTasks.length}
          />
        </div>
      </div>
    </div>
  );
}
