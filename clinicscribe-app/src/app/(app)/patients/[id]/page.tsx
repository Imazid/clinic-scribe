'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  Edit,
  FileOutput,
  ListChecks,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { HeroStrip, HeroAccent, type HeroStripStat } from '@/components/ui/HeroStrip';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { PatientTimeline } from '@/components/patients/PatientTimeline';
import { PatientStorySummary } from '@/components/patients/PatientStorySummary';
import { PatientStoryFeed } from '@/components/patients/PatientStoryFeed';
import { PatientSections } from '@/components/patient/PatientSections';
import { getPatient, getPatientConsultations } from '@/lib/api/patients';
import {
  getPatientTimeline,
  getCareTasks,
  getGeneratedDocuments,
} from '@/lib/api/workflow';
import { useAuthStore } from '@/lib/stores/auth-store';
import type {
  Patient,
  Consultation,
  ConsentStatus,
  TimelineEvent,
  CareTask,
  GeneratedDocument,
} from '@/lib/types';
import { cn } from '@/lib/utils';

const consentVariant: Record<ConsentStatus, 'success' | 'error' | 'warning'> = {
  granted: 'success',
  revoked: 'error',
  pending: 'warning',
};

type Tab = 'timeline' | 'sections';

const TABS: Array<{ id: Tab; label: string; icon: typeof Clock }> = [
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'sections', label: 'Sections', icon: ListChecks },
];

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

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [patientTasks, setPatientTasks] = useState<CareTask[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('timeline');

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        getPatient(id),
        getPatientConsultations(id),
      ]);
      setPatient(p);
      setConsultations(c as Consultation[]);
      const timeline = await getPatientTimeline(id);
      setTimelineEvents((timeline.events || []) as unknown as TimelineEvent[]);

      if (clinicId) {
        const [allTasks, allDocs] = await Promise.all([
          getCareTasks(clinicId, 'all'),
          getGeneratedDocuments(clinicId),
        ]);
        setPatientTasks(allTasks.filter((t) => t.patient_id === id));
        setPatientDocuments(allDocs.filter((d) => d.patient_id === id));
      }
    } catch (err) {
      console.error('[patient-load]', err);
    } finally {
      setLoading(false);
    }
  }, [id, clinicId]);

  useEffect(() => {
    load();
  }, [load]);

  const openTaskCount = useMemo(
    () => patientTasks.filter((t) => ['open', 'in_progress'].includes(t.status)).length,
    [patientTasks],
  );

  const overdueTaskCount = useMemo(
    () =>
      patientTasks.filter(
        (t) =>
          t.due_at != null &&
          new Date(t.due_at).getTime() < Date.now() &&
          t.status !== 'completed',
      ).length,
    [patientTasks],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" className="h-10 w-64" />
        <Skeleton variant="rectangular" className="h-48 w-full rounded-3xl" />
        <Skeleton variant="rectangular" className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-16 text-center text-on-surface-variant">
        Patient not found.
      </div>
    );
  }

  const fullName = `${patient.first_name} ${patient.last_name}`.trim();
  const age = ageFromDob(patient.date_of_birth);
  const sexLabel = patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1);
  const subline = [
    age != null ? `${age}` : null,
    sexLabel,
    patient.mrn ? `MRN-${patient.mrn}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const stats: HeroStripStat[] = [
    {
      label: 'Visits',
      value: consultations.length,
      sub:
        patient.last_appointment_at
          ? `Last ${new Date(patient.last_appointment_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
          : 'No visits yet',
      icon: CalendarCheck,
      tone: 'default',
    },
    {
      label: 'Allergies',
      value: patient.allergies.length,
      sub: patient.allergies.length === 0 ? 'NKDA' : 'Surfaced in briefs',
      icon: AlertTriangle,
      tone: patient.allergies.length > 0 ? 'error' : 'default',
    },
    {
      label: 'Open follow-ups',
      value: openTaskCount,
      sub: overdueTaskCount > 0 ? `${overdueTaskCount} overdue` : 'On track',
      icon: ClipboardCheck,
      tone: overdueTaskCount > 0 ? 'error' : 'default',
    },
    {
      label: 'Documents',
      value: patientDocuments.length,
      sub: 'On file',
      icon: FileOutput,
      tone: 'default',
    },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: 'Patients', href: '/patients' },
          { label: fullName },
        ]}
      />

      <HeroStrip
        eyebrow="Patient profile"
        title={
          <span className="inline-flex items-center gap-3">
            <Avatar firstName={patient.first_name} lastName={patient.last_name} size="lg" />
            <span>
              {patient.first_name}{' '}
              <HeroAccent>{patient.last_name}</HeroAccent>
            </span>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{subline || 'Patient'}</span>
            <Badge variant={consentVariant[patient.consent_status]} className="text-[11px]">
              <ShieldCheck className="mr-1 h-3 w-3" /> {patient.consent_status}
            </Badge>
          </span>
        }
        stats={stats}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push(`/patients/${id}/edit`)}
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button
              size="md"
              onClick={() => router.push(`/consultations/new?patient_id=${id}`)}
            >
              <Mic className="h-4 w-4" /> Start consultation
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.id === 'timeline'
              ? consultations.length + timelineEvents.length
              : tab.id === 'sections'
                ? openTaskCount + patientDocuments.length
                : undefined;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-transparent bg-primary text-on-primary'
                  : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-secondary/30 hover:text-secondary',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-on-primary/15 text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'timeline' ? (
        <div className="space-y-6">
          <Card>
            <PatientStorySummary
              patient={patient}
              consultations={consultations}
              events={timelineEvents}
            />
          </Card>
          <Card>
            <CardTitle className="mb-4">Visit history</CardTitle>
            <PatientTimeline
              consultations={consultations}
              timelineEvents={timelineEvents}
            />
          </Card>
          <Card>
            <CardTitle className="mb-4">Story feed</CardTitle>
            <PatientStoryFeed events={timelineEvents} />
          </Card>
        </div>
      ) : (
        <PatientSections
          patient={patient}
          tasks={patientTasks}
          documents={patientDocuments}
        />
      )}
    </div>
  );
}
