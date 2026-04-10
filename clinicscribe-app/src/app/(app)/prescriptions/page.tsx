'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Pill, Sparkles, Stethoscope } from 'lucide-react';

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Prescriptions"
        description="Prepare ready-to-prescribe medication drafts directly from verified notes and task context."
        variant="feature"
      />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant/40 px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-base">Coming soon</CardTitle>
            <Badge variant="warning">Soon</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            This workspace will let clinicians review medication suggestions, confirm doses, and turn approved note output into ready prescription drafts.
          </p>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
          <div className="rounded-2xl bg-surface-container-low px-4 py-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-on-surface">AI-prepared drafts</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Build medication drafts from verified consult notes, follow-up tasks, and patient context.
            </p>
          </div>

          <div className="rounded-2xl bg-surface-container-low px-4 py-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Pill className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-on-surface">Ready prescriptions</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Review medicine, dose, quantity, and repeats before creating a final prescription.
            </p>
          </div>

          <div className="rounded-2xl bg-surface-container-low px-4 py-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Stethoscope className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-on-surface">Clinician sign-off</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Keep prescribing reviewable and clinician-controlled before any future integration or export step.
            </p>
          </div>
        </div>

        <div className="border-t border-outline-variant/40 px-6 py-5">
          <Button variant="outline" size="action" disabled>
            Prescribing workspace coming soon
          </Button>
        </div>
      </Card>
    </div>
  );
}
