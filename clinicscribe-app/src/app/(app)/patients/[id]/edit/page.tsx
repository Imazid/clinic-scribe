'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PatientForm } from '@/components/patients/PatientForm';
import { getPatient, updatePatient } from '@/lib/api/patients';
import { useUIStore } from '@/lib/stores/ui-store';
import type { Patient } from '@/lib/types';
import type { PatientInput } from '@/lib/validators';

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addToast = useUIStore((s) => s.addToast);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { setPatient(await getPatient(id)); }
      catch { addToast('Failed to load patient', 'error'); }
      finally { setLoading(false); }
    }
    load();
  }, [id, addToast]);

  async function handleSubmit(data: PatientInput) {
    await updatePatient(id, data);
    addToast('Patient updated', 'success');
    router.push(`/patients/${id}`);
  }

  if (loading) return <Skeleton variant="rectangular" className="h-96 w-full" />;
  if (!patient) return <div className="text-center py-16 text-on-surface-variant">Patient not found.</div>;

  return (
    <div>
      <BreadcrumbNav items={[{ label: 'Patients', href: '/patients' }, { label: `${patient.first_name} ${patient.last_name}`, href: `/patients/${id}` }, { label: 'Edit' }]} />
      <PageHeader title="Edit Patient" className="mt-4" />
      <Card className="max-w-3xl">
        <PatientForm initialData={patient} onSubmit={handleSubmit} submitLabel="Update Patient" />
      </Card>
    </div>
  );
}
