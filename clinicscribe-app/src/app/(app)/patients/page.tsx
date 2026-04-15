'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PatientCard } from '@/components/patients/PatientCard';
import { PatientFilters } from '@/components/patients/PatientFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePatients } from '@/lib/hooks/usePatients';
import { Plus, Users } from 'lucide-react';

export default function PatientsPage() {
  const router = useRouter();
  const {
    patients,
    loading,
    search,
    setSearch,
    consentFilter,
    setConsentFilter,
    sort,
    setSort,
  } = usePatients();

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Manage your patient directory."
        actions={
          <Button onClick={() => router.push('/patients/new')}>
            <Plus className="w-4 h-4" /> Add Patient
          </Button>
        }
      />

      <PatientFilters
        search={search}
        onSearchChange={setSearch}
        consentFilter={consentFilter}
        onConsentFilterChange={setConsentFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-20 w-full" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={search ? 'Try a different search term.' : 'Add your first patient to get started.'}
          actionLabel={!search ? 'Add Patient' : undefined}
          onAction={!search ? () => router.push('/patients/new') : undefined}
        />
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}
