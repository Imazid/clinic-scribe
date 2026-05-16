'use client';

import {
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Pill,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Patient } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PatientContextPanelProps {
  patient: Patient;
  /** Optional medication list (from visit brief or chart). */
  medications?: Array<{ name: string; dose?: string }>;
  /** Optional summary line from the most recent visit. */
  lastVisit?: { date: string; summary: string; noteId?: string } | null;
  /** Compact mode hides extra sections — used in narrow side-rail. */
  compact?: boolean;
  className?: string;
}

function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 150 ? age : null;
}

function formatDob(dob: string | null | undefined): string | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * PatientContextPanel — left rail on the active capture screen. Shows the
 * patient header + a curated set of "what should I have in mind right now"
 * sections: identifiers, allergies, conditions, recent medications, and the
 * latest visit summary if available.
 *
 * Pure render — receives data from the parent. No data fetching here.
 */
export function PatientContextPanel({
  patient,
  medications = [],
  lastVisit,
  compact = false,
  className,
}: PatientContextPanelProps) {
  const age = ageFromDob(patient.date_of_birth);
  const dob = formatDob(patient.date_of_birth);
  const sex = patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Patient header */}
      <div className="flex items-center gap-3.5">
        <Avatar
          firstName={patient.first_name}
          lastName={patient.last_name}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-[18px] font-bold tracking-[-0.01em] text-on-surface">
              {patient.first_name} {patient.last_name}
            </h3>
            {patient.mrn && (
              <Badge variant="default" className="font-mono text-[10px]">
                MRN-{patient.mrn}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 text-xs text-on-surface-variant">
            {[age != null ? `${age}` : null, sex, dob ? `DOB ${dob}` : null]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      </div>

      {/* Allergies */}
      {patient.allergies.length > 0 && (
        <div>
          <div className="eyebrow mb-2">Allergies</div>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies.map((a) => (
              <Badge key={a} variant="error" className="gap-1 text-[11px]">
                <AlertTriangle className="h-3 w-3" /> {a}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active issues / conditions */}
      {patient.conditions.length > 0 && (
        <div>
          <div className="eyebrow mb-2">Active issues</div>
          <div className="flex flex-wrap gap-1.5">
            {patient.conditions.map((c, i) => (
              <Badge
                key={c}
                variant={i === 0 ? 'warning' : 'default'}
                className="gap-1 text-[11px]"
              >
                {i === 0 && <AlertCircle className="h-3 w-3" />}
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {!compact && medications.length > 0 && (
        <div>
          <div className="eyebrow mb-2">Current medications</div>
          <div className="overflow-hidden rounded-xl bg-surface-container-low">
            {medications.slice(0, 6).map((m, i) => (
              <div
                key={`${m.name}-${i}`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2',
                  i < Math.min(medications.length, 6) - 1 &&
                    'border-b border-outline-variant/60',
                )}
              >
                <Pill className="h-3.5 w-3.5 shrink-0 text-secondary" />
                <div className="text-[13px] font-semibold text-on-surface">{m.name}</div>
                {m.dose && (
                  <div className="ml-auto text-xs text-on-surface-variant">{m.dose}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!compact && lastVisit && (
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2">
            <Stethoscope className="h-3 w-3" /> Last visit · {lastVisit.date}
          </div>
          <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5 text-[13px] leading-relaxed text-on-surface-variant">
            {lastVisit.summary}
            {lastVisit.noteId && (
              <Link
                href={`/consultations/${lastVisit.noteId}`}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Open last note
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
