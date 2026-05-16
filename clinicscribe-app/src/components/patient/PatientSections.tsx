'use client';

import { useMemo } from 'react';
import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  FileOutput,
  FileText,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  GENERATED_DOCUMENT_KIND_LABELS,
  GENERATED_DOCUMENT_STATUS_LABELS,
  CARE_TASK_STATUS_LABELS,
} from '@/lib/constants';
import type { CareTask, GeneratedDocument, Patient } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PatientSectionsProps {
  patient: Patient;
  tasks: CareTask[];
  documents: GeneratedDocument[];
}

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, title, description, children }: SectionCardProps) {
  return (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="border-b border-outline-variant/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface">{title}</p>
            {description && (
              <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </Card>
  );
}

interface RowProps {
  label: string;
  value?: string | number | null;
  icon?: LucideIcon;
}

function Row({ label, value, icon: Icon }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2 text-on-surface-variant">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-right text-sm font-semibold text-on-surface">
        {value === null || value === undefined || value === '' ? '—' : value}
      </div>
    </div>
  );
}

export function PatientSections({ patient, tasks, documents }: PatientSectionsProps) {
  const age = useMemo(() => {
    if (!patient.date_of_birth) return null;
    const dob = new Date(patient.date_of_birth);
    if (Number.isNaN(dob.getTime())) return null;
    const now = new Date();
    let a = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a -= 1;
    return a >= 0 && a < 150 ? a : null;
  }, [patient.date_of_birth]);

  const sexLabel =
    patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1);

  const openTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  // Sample "now" once per task-list change; sub-second freshness isn't needed
  // for an overdue badge but the value should refresh when tasks reload.
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), [tasks]);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Demographics */}
      <SectionCard
        icon={User}
        title="Demographics"
        description="Personal identity used across notes and exports"
      >
        <Row label="Date of birth" icon={Calendar} value={formatDate(patient.date_of_birth)} />
        <Row label="Age" value={age != null ? `${age} years` : null} />
        <Row label="Sex" value={sexLabel} />
        <Row label="Last visit" icon={CalendarCheck} value={patient.last_appointment_at ? formatDate(patient.last_appointment_at) : null} />
      </SectionCard>

      {/* Contact */}
      <SectionCard icon={Phone} title="Contact" description="Used for follow-up and patient communications">
        <Row label="Email" icon={Mail} value={patient.email} />
        <Row label="Phone" icon={Phone} value={patient.phone} />
        <Row label="Primary location" icon={MapPin} value={patient.location} />
        <Row label="Preferred provider" icon={Stethoscope} value={patient.provider_name} />
      </SectionCard>

      {/* Identifiers */}
      <SectionCard icon={Shield} title="Identifiers" description="Billing, Medicare, and cross-system matching">
        <Row label="MRN" value={patient.mrn} />
        <Row label="Medicare" value={patient.medicare_number} />
        <Row label="IHI" value={patient.ihi} />
        <Row label="Height" icon={Ruler} value={patient.height_cm != null ? `${patient.height_cm} cm` : null} />
      </SectionCard>

      {/* Allergies + active issues */}
      <SectionCard icon={AlertTriangle} title="Medical context" description="Surfaces in every consultation brief">
        <div className="space-y-3">
          <div>
            <div className="eyebrow mb-1.5">Allergies</div>
            {patient.allergies.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No known allergies.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((a) => (
                  <Badge key={a} variant="error" className="text-[11px]">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="eyebrow mb-1.5">Active conditions</div>
            {patient.conditions.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No recorded conditions.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {patient.conditions.map((c) => (
                  <Badge key={c} variant="warning" className="text-[11px]">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Open follow-ups */}
      <SectionCard
        icon={ClipboardCheck}
        title="Follow-ups"
        description={`${openTasks.length} open · ${completedTasks.length} closed`}
      >
        {tasks.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No follow-up tasks recorded.</p>
        ) : (
          <ul className="space-y-2.5">
            {tasks.slice(0, 6).map((task) => {
              const isOverdue =
                task.due_at != null &&
                new Date(task.due_at).getTime() < now &&
                task.status !== 'completed';
              const isDone = task.status === 'completed';
              return (
                <li
                  key={task.id}
                  className={cn(
                    'rounded-xl border border-outline-variant/40 bg-surface-container-low px-3.5 py-2.5',
                    isDone && 'opacity-60',
                    isOverdue && 'border-error/30 bg-error/5',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        isDone ? 'text-on-surface-variant line-through' : 'text-on-surface',
                      )}
                    >
                      {task.title}
                    </p>
                    <Badge
                      variant={
                        isDone
                          ? 'success'
                          : task.status === 'in_progress'
                            ? 'info'
                            : 'default'
                      }
                      className="shrink-0 text-[10px]"
                    >
                      {CARE_TASK_STATUS_LABELS[task.status]}
                    </Badge>
                  </div>
                  {task.due_at && (
                    <p
                      className={cn(
                        'mt-1.5 inline-flex items-center gap-1 text-xs',
                        isOverdue ? 'font-semibold text-error' : 'text-on-surface-variant',
                      )}
                    >
                      <CalendarClock className="h-3 w-3" />
                      {isOverdue ? 'Overdue · ' : 'Due '}
                      {new Date(task.due_at).toLocaleDateString('en-AU')}
                    </p>
                  )}
                </li>
              );
            })}
            {tasks.length > 6 && (
              <p className="text-center text-xs text-outline">
                + {tasks.length - 6} more — open the tasks workspace to see all
              </p>
            )}
          </ul>
        )}
      </SectionCard>

      {/* Documents */}
      <SectionCard
        icon={FileOutput}
        title="Generated documents"
        description={`${documents.length} on file`}
      >
        {documents.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No generated documents for this patient yet. They appear here after a clinical note is approved.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {documents.slice(0, 5).map((doc) => (
              <li
                key={doc.id}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3.5 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-secondary" />
                      <span className="truncate">{doc.title}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {GENERATED_DOCUMENT_KIND_LABELS[doc.kind] || doc.kind.replace('_', ' ')} ·{' '}
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      doc.status === 'sent'
                        ? 'success'
                        : doc.status === 'ready'
                          ? 'info'
                          : 'warning'
                    }
                    className="shrink-0 text-[10px]"
                  >
                    {GENERATED_DOCUMENT_STATUS_LABELS[doc.status]}
                  </Badge>
                </div>
              </li>
            ))}
            {documents.length > 5 && (
              <p className="text-center text-xs text-outline">
                + {documents.length - 5} more
              </p>
            )}
          </ul>
        )}
      </SectionCard>

      {/* Notes */}
      {patient.notes && (
        <SectionCard
          icon={FileText}
          title="Clinician notes"
          description="Free-text context for the AI and your future self"
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
            {patient.notes}
          </p>
        </SectionCard>
      )}
    </div>
  );
}
