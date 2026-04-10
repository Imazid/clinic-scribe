'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getConsultations } from '@/lib/api/consultations';
import type { Consultation } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { CONSULTATION_STATUS_LABELS } from '@/lib/constants';

interface SessionRailProps {
  activeConsultationId?: string | null;
}

function groupLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  return 'Earlier';
}

export function SessionRail({ activeConsultationId }: SessionRailProps) {
  const router = useRouter();
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!clinicId) {
        setConsultations([]);
        return;
      }

      try {
        const nextConsultations = await getConsultations(clinicId);
        if (!cancelled) {
          setConsultations(nextConsultations.slice(0, 10));
        }
      } catch {
        if (!cancelled) {
          setConsultations([]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  const grouped = useMemo(() => {
    return consultations.reduce<Record<string, Consultation[]>>((groups, consultation) => {
      const label = groupLabel(consultation.created_at);
      groups[label] = groups[label] ?? [];
      groups[label].push(consultation);
      return groups;
    }, {});
  }, [consultations]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-outline-variant/30 px-5 py-5">
        <Button className="w-full justify-center" onClick={() => router.push('/consultations/new')}>
          <Plus className="h-4 w-4" />
          New session
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              {label}
            </p>
            {items.map((consultation) => {
              const isActive = activeConsultationId === consultation.id;
              return (
                <Link
                  key={consultation.id}
                  href={`/consultations/${consultation.id}`}
                  className={`block rounded-[1.25rem] border px-3 py-3 transition ${
                    isActive
                      ? 'border-secondary/30 bg-secondary/10'
                      : 'border-transparent bg-surface-container-low hover:border-outline-variant/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {consultation.patient
                          ? `${consultation.patient.first_name} ${consultation.patient.last_name}`
                          : consultation.consultation_type}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {formatDateTime(consultation.created_at)}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-container px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                      {CONSULTATION_STATUS_LABELS[consultation.status]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}

        {consultations.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-outline-variant/50 px-4 py-6 text-center text-sm text-on-surface-variant">
            Your recent capture sessions will appear here.
          </div>
        ) : null}
      </div>
    </div>
  );
}
