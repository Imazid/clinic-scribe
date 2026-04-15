'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import {
  approvePrescription,
  getPrescriptionsForClinic,
  updatePrescription,
} from '@/lib/api/prescriptions';
import type { Prescription, PrescriptionStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ArrowRight, CheckCircle, FileText, Pill, Printer, Truck } from 'lucide-react';

type StatusFilter = PrescriptionStatus | 'all';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Printed', value: 'printed' },
  { label: 'Dispensed', value: 'dispensed' },
  { label: 'Void', value: 'void' },
];

function statusVariant(
  status: PrescriptionStatus
): 'default' | 'warning' | 'success' | 'info' | 'error' {
  switch (status) {
    case 'draft':
      return 'warning';
    case 'approved':
      return 'info';
    case 'printed':
    case 'dispensed':
      return 'success';
    case 'void':
      return 'error';
    default:
      return 'default';
  }
}

const NEXT_STATUS: Partial<
  Record<PrescriptionStatus, { label: string; next: PrescriptionStatus; icon: typeof CheckCircle }>
> = {
  draft: { label: 'Approve', next: 'approved', icon: CheckCircle },
  approved: { label: 'Mark Printed', next: 'printed', icon: Printer },
  printed: { label: 'Mark Dispensed', next: 'dispensed', icon: Truck },
};

export default function PrescriptionsPage() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const clinicId = profile?.clinic_id;
  const addToast = useUIStore((state) => state.addToast);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const rows = await getPrescriptionsForClinic(clinicId, { status });
      setPrescriptions(rows);
    } catch (error) {
      console.error(error);
      addToast('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, clinicId, status]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const tally: Record<StatusFilter, number> = {
      all: prescriptions.length,
      draft: 0,
      approved: 0,
      printed: 0,
      dispensed: 0,
      void: 0,
    };
    for (const rx of prescriptions) tally[rx.status] += 1;
    return tally;
  }, [prescriptions]);

  const filteredPrescriptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return prescriptions;
    return prescriptions.filter((rx) => {
      const patientName = rx.patient
        ? `${rx.patient.first_name} ${rx.patient.last_name}`.toLowerCase()
        : '';
      const medNames = rx.items.map((item) => item.name.toLowerCase()).join(' ');
      return patientName.includes(q) || medNames.includes(q);
    });
  }, [prescriptions, searchQuery]);

  async function handleOpenPdf(rx: Prescription) {
    if (!rx.consultation_id) {
      addToast('Prescription is not linked to a consultation', 'warning');
      return;
    }
    try {
      const res = await fetch(
        `/api/consultations/${rx.consultation_id}/prescription/pdf`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prescriptionId: rx.id }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'PDF render failed' }));
        throw new Error(data.error || 'PDF render failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open PDF';
      addToast(message, 'error');
    }
  }

  async function handleProgressStatus(rx: Prescription) {
    const progression = NEXT_STATUS[rx.status];
    if (!progression) return;

    setUpdatingId(rx.id);
    try {
      let updated: Prescription;
      if (rx.status === 'draft') {
        updated = await approvePrescription(rx.id, profile?.id ?? null);
      } else {
        updated = await updatePrescription(rx.id, { status: progression.next });
      }
      setPrescriptions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      addToast(`Prescription ${progression.label.toLowerCase()}d`, 'success');
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to update prescription',
        'error'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Prescriptions"
        description="Review, approve, and print medication drafts created directly from clinician-verified notes."
        variant="feature"
      />

      <SearchInput
        value={searchQuery}
        onSearch={setSearchQuery}
        placeholder="Search by patient or medication name"
      />

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isActive = option.value === status;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {option.label}
              <span
                className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-on-secondary/20 text-on-secondary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {option.value === 'all' ? counts.all : counts[option.value]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={
            prescriptions.length === 0
              ? 'No prescriptions drafted yet'
              : 'No prescriptions match your search'
          }
          description={
            prescriptions.length === 0
              ? 'Start a prescription from a consultation review page after verifying the note.'
              : 'Try a different search term or adjust the status filter.'
          }
          actionLabel={prescriptions.length === 0 ? 'Go to preparation queue' : undefined}
          onAction={prescriptions.length === 0 ? () => router.push('/prepare') : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredPrescriptions.map((rx) => {
            const patientName = rx.patient
              ? `${rx.patient.first_name} ${rx.patient.last_name}`
              : 'Unknown patient';
            const progression = NEXT_STATUS[rx.status];
            return (
              <Card
                key={rx.id}
                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{patientName}</CardTitle>
                      <Badge variant={statusVariant(rx.status)}>{rx.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {rx.items.length} item{rx.items.length === 1 ? '' : 's'} · Created{' '}
                      {formatDate(rx.created_at)}
                    </p>
                    {rx.items[0]?.name && (
                      <p className="mt-1 text-xs text-on-surface-variant">
                        First item: {rx.items[0].name}
                        {rx.items.length > 1 ? ` (+${rx.items.length - 1} more)` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {progression ? (
                    <Button
                      size="sm"
                      onClick={() => handleProgressStatus(rx)}
                      isLoading={updatingId === rx.id}
                    >
                      <progression.icon className="h-4 w-4" />
                      {progression.label}
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => handleOpenPdf(rx)}>
                    <FileText className="h-4 w-4" />
                    View PDF
                  </Button>
                  {rx.consultation_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/consultations/${rx.consultation_id}/review`)}
                    >
                      Edit in review
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
