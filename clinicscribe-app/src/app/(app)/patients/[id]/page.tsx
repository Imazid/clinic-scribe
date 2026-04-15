'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PatientTimeline } from '@/components/patients/PatientTimeline';
import { PatientStorySummary } from '@/components/patients/PatientStorySummary';
import { PatientStoryFeed } from '@/components/patients/PatientStoryFeed';
import { Avatar } from '@/components/ui/Avatar';
import { getPatient, getPatientConsultations } from '@/lib/api/patients';
import { getPatientTimeline, getCareTasks, getGeneratedDocuments } from '@/lib/api/workflow';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate } from '@/lib/utils';
import { GENERATED_DOCUMENT_KIND_LABELS, GENERATED_DOCUMENT_STATUS_LABELS, CARE_TASK_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Patient, Consultation, ConsentStatus, TimelineEvent, CareTask, GeneratedDocument } from '@/lib/types';
import {
  Edit,
  Mic,
  Phone,
  Mail,
  Calendar,
  Shield,
  LayoutDashboard,
  Clock,
  FileOutput,
  ClipboardCheck,
  FileText,
  CalendarClock,
  AlertTriangle,
  MapPin,
  Ruler,
  Stethoscope,
  CalendarCheck,
} from 'lucide-react';

const consentVariant: Record<ConsentStatus, 'success' | 'error' | 'warning'> = {
  granted: 'success', revoked: 'error', pending: 'warning',
};

type Tab = 'overview' | 'timeline' | 'documents' | 'tasks';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'documents', label: 'Documents', icon: FileOutput },
  { id: 'tasks', label: 'Tasks', icon: ClipboardCheck },
];

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
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([getPatient(id), getPatientConsultations(id)]);
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [id, clinicId]);

  useEffect(() => {
    load();
  }, [load]);

  const openTaskCount = useMemo(
    () => patientTasks.filter((t) => ['open', 'in_progress'].includes(t.status)).length,
    [patientTasks]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" className="h-8 w-48" />
        <Skeleton variant="rectangular" className="h-64 w-full" />
      </div>
    );
  }

  if (!patient) return <div className="text-center py-16 text-on-surface-variant">Patient not found.</div>;

  return (
    <div>
      <BreadcrumbNav items={[{ label: 'Patients', href: '/patients' }, { label: `${patient.first_name} ${patient.last_name}` }]} />
      <PageHeader
        title={`${patient.first_name} ${patient.last_name}`}
        className="mt-4"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push(`/consultations/new?patient_id=${id}`)}>
              <Mic className="w-4 h-4" /> Start consultation
            </Button>
            <Button variant="outline" onClick={() => router.push(`/patients/${id}/edit`)}>
              <Edit className="w-4 h-4" /> Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar — patient info */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <Avatar firstName={patient.first_name} lastName={patient.last_name} size="lg" />
              <div>
                <p className="font-semibold text-on-surface">{patient.first_name} {patient.last_name}</p>
                <Badge variant={consentVariant[patient.consent_status]}>{patient.consent_status}</Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Calendar className="w-4 h-4" /> DOB: {formatDate(patient.date_of_birth)}
              </div>
              {patient.phone && <div className="flex items-center gap-2 text-on-surface-variant"><Phone className="w-4 h-4" /> {patient.phone}</div>}
              {patient.email && <div className="flex items-center gap-2 text-on-surface-variant"><Mail className="w-4 h-4" /> {patient.email}</div>}
              {patient.mrn && <div className="flex items-center gap-2 text-on-surface-variant"><Shield className="w-4 h-4" /> MRN: {patient.mrn}</div>}
            </div>
          </Card>

          {(patient.provider_name ||
            patient.location ||
            patient.height_cm != null ||
            patient.last_appointment_at) && (
            <Card>
              <p className="label-text text-on-surface-variant mb-3">Care Context</p>
              <div className="space-y-2 text-sm">
                {patient.provider_name && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Stethoscope className="w-4 h-4" /> {patient.provider_name}
                  </div>
                )}
                {patient.location && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <MapPin className="w-4 h-4" /> {patient.location}
                  </div>
                )}
                {patient.height_cm != null && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Ruler className="w-4 h-4" /> {patient.height_cm} cm
                  </div>
                )}
                {patient.last_appointment_at && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <CalendarCheck className="w-4 h-4" /> Last visit: {formatDate(patient.last_appointment_at)}
                  </div>
                )}
              </div>
            </Card>
          )}

          {(patient.allergies.length > 0 || patient.conditions.length > 0) && (
            <Card>
              {patient.allergies.length > 0 && (
                <div className="mb-4">
                  <p className="label-text text-on-surface-variant mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-error/10 text-error text-xs font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {patient.conditions.length > 0 && (
                <div>
                  <p className="label-text text-on-surface-variant mb-2">Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.conditions.map((c, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-secondary/10 text-secondary text-xs font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right content — tabbed area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-outline-variant/20 pb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count =
                tab.id === 'tasks' ? openTaskCount :
                tab.id === 'documents' ? patientDocuments.length :
                tab.id === 'timeline' ? consultations.length + timelineEvents.length :
                undefined;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px',
                    activeTab === tab.id
                      ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count !== undefined && count > 0 && (
                    <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <PatientStorySummary patient={patient} consultations={consultations} events={timelineEvents} />
              </Card>
              <Card>
                <PatientStoryFeed events={timelineEvents} />
              </Card>
            </div>
          )}

          {activeTab === 'timeline' && (
            <Card>
              <CardTitle className="mb-4">Patient Timeline</CardTitle>
              <PatientTimeline consultations={consultations} timelineEvents={timelineEvents} />
            </Card>
          )}

          {activeTab === 'documents' && (
            <Card>
              <CardTitle className="mb-4">Generated Documents</CardTitle>
              {patientDocuments.length === 0 ? (
                <div className="text-center py-8 text-sm text-on-surface-variant">
                  No generated documents for this patient yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientDocuments.map((doc) => (
                    <div key={doc.id} className="rounded-xl bg-surface-container-low px-4 py-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-secondary" />
                            <p className="text-sm font-semibold text-on-surface">{doc.title}</p>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {GENERATED_DOCUMENT_KIND_LABELS[doc.kind] || doc.kind.replace('_', ' ')}
                            {' · '}
                            {formatDate(doc.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            doc.status === 'sent' ? 'success' :
                            doc.status === 'ready' ? 'info' : 'warning'
                          }
                        >
                          {GENERATED_DOCUMENT_STATUS_LABELS[doc.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-3 whitespace-pre-wrap">
                        {doc.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'tasks' && (
            <Card>
              <CardTitle className="mb-4">Care Tasks</CardTitle>
              {patientTasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-on-surface-variant">
                  No care tasks for this patient yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientTasks.map((task) => {
                    const isOverdue = task.due_at && new Date(task.due_at) < new Date();
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'rounded-xl px-4 py-3',
                          isDone ? 'bg-surface-container-low opacity-70' :
                          isOverdue ? 'bg-error/5 ring-1 ring-error/20' :
                          'bg-surface-container-low'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className={cn(
                            'text-sm font-semibold',
                            isDone ? 'text-on-surface-variant line-through' : 'text-on-surface'
                          )}>
                            {task.title}
                          </p>
                          <Badge
                            variant={
                              task.status === 'completed' ? 'success' :
                              task.status === 'in_progress' ? 'info' : 'default'
                            }
                          >
                            {CARE_TASK_STATUS_LABELS[task.status]}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-on-surface-variant line-clamp-2 mb-2">{task.description}</p>
                        )}
                        {task.due_at && (
                          <p className={cn(
                            'text-xs flex items-center gap-1',
                            isOverdue && !isDone ? 'text-error font-medium' : 'text-on-surface-variant'
                          )}>
                            {isOverdue && !isDone && <AlertTriangle className="w-3 h-3" />}
                            <CalendarClock className="w-3.5 h-3.5" />
                            {isOverdue && !isDone ? 'Overdue · ' : ''}
                            Due {new Date(task.due_at).toLocaleDateString('en-AU')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
