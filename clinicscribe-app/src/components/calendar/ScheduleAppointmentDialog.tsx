'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PatientSearchCombobox } from '@/components/patients/PatientSearchCombobox';
import { ConsultationTypeSelect } from '@/components/consultations/ConsultationTypeSelect';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { createScheduledConsultation } from '@/lib/api/consultations';
import type { Consultation, Patient } from '@/lib/types';
import { Building2, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Default date for the date picker — typically the calendar's selected day. */
  defaultDate?: Date;
  /** Pre-select a patient (e.g., when scheduling a follow-up from the detail panel). */
  defaultPatient?: Patient | null;
  /** Called after a successful insert so the parent can refresh the calendar. */
  onCreated?: (consultation: Consultation) => void;
}

type Mode = 'In-clinic' | 'Telehealth';

const DURATIONS = [15, 30, 45, 60] as const;

function toIsoDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ScheduleAppointmentDialog({
  open,
  onClose,
  defaultDate,
  defaultPatient = null,
  onCreated,
}: Props) {
  const profile = useAuthStore((s) => s.profile);
  const clinicId = profile?.clinic_id;
  const addToast = useUIStore((s) => s.addToast);

  const [patient, setPatient] = useState<Patient | null>(defaultPatient);
  const [date, setDate] = useState(() => toIsoDateInput(defaultDate ?? new Date()));
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(30);
  const [consultationType, setConsultationType] = useState('Standard Consultation');
  const [mode, setMode] = useState<Mode>('In-clinic');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPatient(defaultPatient ?? null);
    setDate(toIsoDateInput(defaultDate ?? new Date()));
    setTime('09:00');
    setDuration(30);
    setConsultationType('Standard Consultation');
    setMode('In-clinic');
    setReason('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit() {
    if (!profile?.id || !clinicId) {
      addToast('Not signed in', 'error');
      return;
    }
    if (!patient) {
      addToast('Pick a patient first', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const scheduledFor = new Date(`${date}T${time}:00`).toISOString();
      const typeWithMode =
        mode === 'Telehealth' && !consultationType.toLowerCase().includes('telehealth')
          ? `${consultationType} · Telehealth`
          : consultationType;
      const created = await createScheduledConsultation({
        clinicId,
        clinicianId: profile.id,
        patientId: patient.id,
        consultationType: typeWithMode,
        scheduledFor,
        durationMinutes: duration,
        reasonForVisit: reason.trim() || consultationType,
      });
      addToast('Appointment booked', 'success');
      onCreated?.(created);
      onClose();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to book appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Schedule appointment"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} isLoading={submitting} disabled={!patient || submitting}>
            Book appointment
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Patient */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-on-surface">Patient</label>
          {patient ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-on-surface">
                  {patient.first_name} {patient.last_name}
                </p>
                {patient.date_of_birth && (
                  <p className="text-[11px] text-on-surface-variant">
                    DOB {new Date(patient.date_of_birth).toLocaleDateString('en-AU')}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Clear patient"
                onClick={() => setPatient(null)}
                className="rounded-md p-1 text-on-surface-variant hover:bg-surface-container"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <PatientSearchCombobox clinicId={clinicId} onSelect={setPatient} />
          )}
        </div>

        {/* Date + time + duration */}
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            step={900}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-on-surface">Duration</label>
            <div className="flex h-[38px] items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-1">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={cn(
                    'flex-1 rounded-md text-[12px] font-semibold transition-colors',
                    duration === d
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface',
                  )}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Type + mode */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-on-surface">
              Consultation type
            </label>
            <ConsultationTypeSelect value={consultationType} onChange={setConsultationType} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-on-surface">Mode</label>
            <div className="grid h-[38px] grid-cols-2 gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-1">
              {(['In-clinic', 'Telehealth'] as const).map((m) => {
                const Icon = m === 'Telehealth' ? Video : Building2;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-md text-[12px] font-semibold transition-colors',
                      mode === m
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reason */}
        <Input
          label="Reason for visit"
          placeholder="e.g. BP review, follow-up on labs"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Dialog>
  );
}
