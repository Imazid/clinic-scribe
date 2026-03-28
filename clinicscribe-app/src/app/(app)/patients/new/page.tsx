'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { Card } from '@/components/ui/Card';
import { PatientForm } from '@/components/patients/PatientForm';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { createPatient } from '@/lib/api/patients';
import type { PatientInput } from '@/lib/validators';

export default function NewPatientPage() {
  const router = useRouter();
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const addToast = useUIStore((s) => s.addToast);

  async function handleSubmit(data: PatientInput) {
    if (!clinicId) {
      addToast('Profile not loaded. Please refresh and try again.', 'error');
      return;
    }
    try {
      await createPatient(clinicId, data);
      addToast('Patient added successfully', 'success');
      router.push('/patients');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to add patient', 'error');
      throw err;
    }
  }

  return (
    <div>
      <BreadcrumbNav items={[{ label: 'Patients', href: '/patients' }, { label: 'New Patient' }]} />
      <PageHeader title="Add Patient" className="mt-4" />
      <Card className="max-w-3xl">
        <PatientForm onSubmit={handleSubmit} submitLabel="Add Patient" />
      </Card>
    </div>
  );
}
