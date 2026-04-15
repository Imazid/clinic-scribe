'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  CircleUser,
  Fingerprint,
  HeartPulse,
  Phone,
  ShieldCheck,
  Stethoscope,
  Ruler,
  MapPin,
  UserRound,
} from 'lucide-react';
import type { Consultation, Patient } from '@/lib/types';
import { getConsultationsForPatient } from '@/lib/api/consultations';
import { formatDate } from '@/lib/utils';

interface PatientContextCardProps {
  patient: Patient;
  clinicId?: string | null;
}

function calculateAge(dob: string | null): string {
  if (!dob) return '—';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '—';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return `${age} y`;
}

export function PatientContextCard({ patient, clinicId }: PatientContextCardProps) {
  const [lastVisit, setLastVisit] = useState<Consultation | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!clinicId) return;
    (async () => {
      try {
        const rows = await getConsultationsForPatient(clinicId, patient.id);
        if (!cancelled) setLastVisit(rows[0] ?? null);
      } catch {
        if (!cancelled) setLastVisit(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clinicId, patient.id]);

  const allergyCount = patient.allergies?.length ?? 0;
  const conditionCount = patient.conditions?.length ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-on-surface">
              {patient.first_name} {patient.last_name}
            </h3>
            {patient.mrn && (
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary">
                MRN {patient.mrn}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <CircleUser className="h-3 w-3" />
              {calculateAge(patient.date_of_birth)} &middot; {patient.sex}
            </span>
            {patient.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {patient.phone}
              </span>
            )}
          </div>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            patient.consent_status === 'granted'
              ? 'bg-primary/10 text-primary'
              : patient.consent_status === 'pending'
              ? 'bg-warning/10 text-warning'
              : 'bg-error/10 text-error'
          }`}
        >
          <ShieldCheck className="h-3 w-3" />
          Consent: {patient.consent_status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailTile
          icon={<Fingerprint className="h-3.5 w-3.5" />}
          label="Identifiers"
          value={
            [
              patient.mrn && `MRN ${patient.mrn}`,
              patient.medicare_number && `Medicare ${patient.medicare_number}`,
              patient.ihi && `IHI ${patient.ihi}`,
            ]
              .filter(Boolean)
              .join(' · ') || '—'
          }
        />
        <DetailTile
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          label="Provider"
          value="—"
          hint="Linked from clinic roster"
        />
        <DetailTile
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Location"
          value="—"
          hint="Set on patient profile"
        />
        <DetailTile
          icon={<Ruler className="h-3.5 w-3.5" />}
          label="Height"
          value="—"
          hint="Add in patient form"
        />
        <DetailTile
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Last visit"
          value={
            lastVisit
              ? formatDate(lastVisit.completed_at ?? lastVisit.started_at ?? lastVisit.created_at)
              : 'No prior visits'
          }
          hint={lastVisit?.consultation_type}
        />
        <DetailTile
          icon={<UserRound className="h-3.5 w-3.5" />}
          label="Sex"
          value={patient.sex ?? '—'}
        />
      </div>

      {(allergyCount > 0 || conditionCount > 0) && (
        <div className="mt-4 space-y-2">
          {allergyCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-error" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-error">
                Allergies
              </span>
              {patient.allergies.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-error/10 px-2 py-0.5 text-[11px] text-error"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
          {conditionCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-warning" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-warning">
                Conditions
              </span>
              {patient.conditions.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] text-warning"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface DetailTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}

function DetailTile({ icon, label, value, hint }: DetailTileProps) {
  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-sm text-on-surface">{value}</div>
      {hint && <div className="truncate text-[10px] text-outline">{hint}</div>}
    </div>
  );
}
