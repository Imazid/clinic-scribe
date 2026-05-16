'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
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
      try {
        setPatient(await getPatient(id));
      } catch {
        addToast('Failed to load patient', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, addToast]);

  async function handleSubmit(data: PatientInput) {
    await updatePatient(id, data);
    addToast('Patient updated', 'success');
    router.push(`/patients/${id}`);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" className="h-12 w-64" />
        <Skeleton variant="rectangular" className="h-96 w-full" />
      </div>
    );
  }
  if (!patient) {
    return (
      <div className="py-16 text-center text-on-surface-variant">Patient not found.</div>
    );
  }

  const fullName = `${patient.first_name} ${patient.last_name}`.trim();

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: 'Patients', href: '/patients' },
          { label: fullName, href: `/patients/${id}` },
          { label: 'Edit' },
        ]}
      />
      <PageHeader
        eyebrow="Patients"
        title={`Edit ${fullName}`}
        description="Update demographics, contact, identifiers, and medical context. Changes apply to all future briefs and consultations."
        variant="feature"
      />
      <PatientForm
        initialData={patient}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/patients/${id}`)}
        submitLabel="Update patient"
      />
    </div>
  );
}
