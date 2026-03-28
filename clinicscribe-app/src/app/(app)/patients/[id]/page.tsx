'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PatientTimeline } from '@/components/patients/PatientTimeline';
import { Avatar } from '@/components/ui/Avatar';
import { getPatient, getPatientConsultations } from '@/lib/api/patients';
import { formatDate } from '@/lib/utils';
import type { Patient, Consultation, ConsentStatus } from '@/lib/types';
import { Edit, Phone, Mail, Calendar, Shield } from 'lucide-react';

const consentVariant: Record<ConsentStatus, 'success' | 'error' | 'warning'> = {
  granted: 'success', revoked: 'error', pending: 'warning',
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, c] = await Promise.all([getPatient(id), getPatientConsultations(id)]);
        setPatient(p);
        setConsultations(c as Consultation[]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

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
          <Button variant="outline" onClick={() => router.push(`/patients/${id}/edit`)}>
            <Edit className="w-4 h-4" /> Edit
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <div className="lg:col-span-2">
          <Card>
            <CardTitle className="mb-4">Consultation History</CardTitle>
            <PatientTimeline consultations={consultations} />
          </Card>
        </div>
      </div>
    </div>
  );
}
