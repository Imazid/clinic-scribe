'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsultationCard } from '@/components/consultations/ConsultationCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchInput } from '@/components/ui/SearchInput';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getConsultations } from '@/lib/api/consultations';
import type { Consultation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Mic, Radio, Loader2, CalendarCheck } from 'lucide-react';
import { ScribeWorkspaceShell } from '@/components/scribe/ScribeWorkspaceShell';
import { SessionRail } from '@/components/scribe/SessionRail';

const captureStatuses = ['scheduled', 'brief_ready', 'recording', 'transcribing', 'generating'];

type StatusGroup = 'recording' | 'processing' | 'queued';

function getGroup(status: string): StatusGroup {
  if (status === 'recording') return 'recording';
  if (status === 'transcribing' || status === 'generating') return 'processing';
  return 'queued';
}

const GROUP_CONFIG: Record<StatusGroup, { label: string; icon: React.ComponentType<{ className?: string }>; emptyLabel: string }> = {
  recording: { label: 'Recording Now', icon: Radio, emptyLabel: 'No active recordings' },
  processing: { label: 'Processing', icon: Loader2, emptyLabel: 'Nothing processing' },
  queued: { label: 'Ready to Capture', icon: CalendarCheck, emptyLabel: 'No queued sessions' },
};

const GROUP_ORDER: StatusGroup[] = ['recording', 'processing', 'queued'];

export default function CapturePage() {
  const router = useRouter();
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      if (!clinicId) return;
      setLoading(true);
      try {
        const data = await getConsultations(clinicId);
        setConsultations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [clinicId]);

  const filtered = useMemo(() =>
    consultations.filter((consultation) => {
      if (!captureStatuses.includes(consultation.status)) return false;
      if (!search) return true;
      const patientName = consultation.patient
        ? `${consultation.patient.first_name} ${consultation.patient.last_name}`
        : '';
      return patientName.toLowerCase().includes(search.toLowerCase());
    }),
    [consultations, search]
  );

  const grouped = useMemo(() => {
    const groups: Record<StatusGroup, Consultation[]> = { recording: [], processing: [], queued: [] };
    for (const c of filtered) {
      groups[getGroup(c.status)].push(c);
    }
    return groups;
  }, [filtered]);

  return (
    <ScribeWorkspaceShell
      title="Capture"
      description="Pick up an active session or start a new one."
      actions={
        <Button onClick={() => router.push('/consultations/new')} size="action">
          <Mic className="w-4 h-4" /> New Session
        </Button>
      }
      rail={<SessionRail />}
      metaBar={
        <div className="flex items-center justify-between px-5 py-4">
          <SearchInput
            placeholder="Search by patient name..."
            value={search}
            onSearch={setSearch}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64"
          />
          <p className="text-xs text-on-surface-variant">
            <span className="font-semibold">{filtered.length}</span> session{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      }
      workspace={
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-ambient-sm">
                  <Skeleton variant="circular" className="w-12 h-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Mic}
              title="No active capture sessions"
              description="Start a new session to begin capturing a consultation."
              actionLabel="New session"
              onAction={() => router.push('/consultations/new')}
            />
          ) : (
            <div className="space-y-6">
              {GROUP_ORDER.map((group) => {
                const items = grouped[group];
                if (items.length === 0) return null;
                const config = GROUP_CONFIG[group];
                const Icon = config.icon;
                return (
                  <section key={group}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={cn(
                        'w-4 h-4',
                        group === 'recording' ? 'text-error animate-pulse' :
                        group === 'processing' ? 'text-warning animate-spin' :
                        'text-on-surface-variant'
                      )} />
                      <h3 className="text-sm font-semibold text-on-surface">{config.label}</h3>
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((consultation) => (
                        <ConsultationCard key={consultation.id} consultation={consultation} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      }
    />
  );
}
