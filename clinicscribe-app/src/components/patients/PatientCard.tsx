'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Patient, ConsentStatus } from '@/lib/types';

const consentVariant: Record<ConsentStatus, 'success' | 'error' | 'warning'> = {
  granted: 'success',
  revoked: 'error',
  pending: 'warning',
};

export function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link
      href={`/patients/${patient.id}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-ambient-sm hover:shadow-ambient transition-shadow"
    >
      <Avatar firstName={patient.first_name} lastName={patient.last_name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">
          {patient.first_name} {patient.last_name}
        </p>
        <p className="text-xs text-on-surface-variant">
          DOB: {formatDate(patient.date_of_birth)}
          {patient.mrn && ` | MRN: ${patient.mrn}`}
        </p>
      </div>
      <Badge variant={consentVariant[patient.consent_status]}>
        {patient.consent_status}
      </Badge>
    </Link>
  );
}
