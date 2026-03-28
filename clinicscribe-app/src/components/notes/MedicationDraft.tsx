'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { MedicationDraft as MedicationDraftType } from '@/lib/types';
import { AlertTriangle, Pill } from 'lucide-react';

interface MedicationDraftProps {
  medications: MedicationDraftType[];
  onVerify: (index: number) => void;
}

export function MedicationDraftSection({ medications, onVerify }: MedicationDraftProps) {
  if (medications.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Pill className="w-5 h-5 text-warning" />
        <CardTitle>Medication Drafts</CardTitle>
        <Badge variant="warning">DRAFT ONLY</Badge>
      </div>
      <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 mb-4">
        <p className="text-xs text-warning flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          All medications require clinician verification before prescribing.
        </p>
      </div>
      <div className="space-y-3">
        {medications.map((med, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
            <div>
              <p className="text-sm font-medium text-on-surface">{med.name}</p>
              <p className="text-xs text-on-surface-variant">
                {med.dose} &middot; {med.frequency} &middot; Qty: {med.quantity}
              </p>
            </div>
            <button
              onClick={() => onVerify(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                med.verified
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning hover:bg-warning/20'
              }`}
            >
              {med.verified ? 'Verified' : 'Verify'}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
