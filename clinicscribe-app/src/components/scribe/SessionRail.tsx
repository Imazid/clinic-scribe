'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import {
  deleteConsultation,
  deleteEmptyConsultations,
  getConsultations,
} from '@/lib/api/consultations';
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
  const addToast = useUIStore((state) => state.addToast);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Consultation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tidyConfirmOpen, setTidyConfirmOpen] = useState(false);
  const [tidying, setTidying] = useState(false);

  const load = useCallback(async () => {
    if (!clinicId) {
      setConsultations([]);
      return;
    }
    try {
      const nextConsultations = await getConsultations(clinicId);
      setConsultations(nextConsultations.slice(0, 10));
    } catch {
      setConsultations([]);
    }
  }, [clinicId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const grouped = useMemo(() => {
    return consultations.reduce<Record<string, Consultation[]>>((groups, consultation) => {
      const label = groupLabel(consultation.created_at);
      groups[label] = groups[label] ?? [];
      groups[label].push(consultation);
      return groups;
    }, {});
  }, [consultations]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteConsultation(deleteTarget.id);
      addToast('Session deleted', 'success');
      setDeleteTarget(null);
      await load();
      if (activeConsultationId === deleteTarget.id) {
        router.push('/capture');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete session', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleConfirmTidy() {
    if (!clinicId) return;
    setTidying(true);
    try {
      const removed = await deleteEmptyConsultations(clinicId);
      addToast(
        removed > 0
          ? `Removed ${removed} empty session${removed === 1 ? '' : 's'}`
          : 'No empty sessions to clean up',
        removed > 0 ? 'success' : 'info',
      );
      setTidyConfirmOpen(false);
      await load();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to tidy sessions', 'error');
    } finally {
      setTidying(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 border-b border-outline-variant/30 px-5 py-5">
        <Button className="w-full justify-center" onClick={() => router.push('/consultations/new')}>
          <Plus className="h-4 w-4" />
          New session
        </Button>
        <button
          type="button"
          onClick={() => setTidyConfirmOpen(true)}
          disabled={!clinicId || consultations.length === 0}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-outline-variant/40 bg-transparent px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Tidy empty sessions
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              {label}
            </p>
            {items.map((consultation) => {
              const isActive = activeConsultationId === consultation.id;
              const isDeleting = deletingId === consultation.id;
              return (
                <div key={consultation.id} className="group relative">
                  <Link
                    href={`/consultations/${consultation.id}`}
                    className={`block rounded-[1.25rem] border px-3 py-3 transition ${
                      isActive
                        ? 'border-secondary/30 bg-secondary/10'
                        : 'border-transparent bg-surface-container-low hover:border-outline-variant/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 pr-8">
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(consultation);
                    }}
                    disabled={isDeleting}
                    aria-label="Delete session"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-on-surface-variant opacity-0 transition hover:bg-error/10 hover:text-error focus:opacity-100 group-hover:opacity-100"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete session?"
        description={
          deleteTarget
            ? `This permanently removes the session${
                deleteTarget.patient
                  ? ` for ${deleteTarget.patient.first_name} ${deleteTarget.patient.last_name}`
                  : ''
              }, including its audio, transcript and any generated note.`
            : ''
        }
        confirmLabel="Delete session"
        confirmVariant="danger"
        isLoading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={tidyConfirmOpen}
        title="Tidy empty sessions?"
        description="Removes any session that has no audio, no transcript, and no saved note. Approved and closed sessions are never touched."
        confirmLabel="Tidy up"
        isLoading={tidying}
        onConfirm={handleConfirmTidy}
        onCancel={() => setTidyConfirmOpen(false)}
      />
    </div>
  );
}
