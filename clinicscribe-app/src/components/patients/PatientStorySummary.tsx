'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { CardDescription, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type {
  ClinicalNote,
  Consultation,
  Patient,
  TimelineEvent,
} from '@/lib/types';
import {
  Activity,
  ArrowRightLeft,
  ClipboardCheck,
  FileText,
  Pill,
} from 'lucide-react';

type ConsultationWithMaybeArrayNote = Consultation & {
  clinical_note?: ClinicalNote | ClinicalNote[] | null;
};

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeMedicationName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sentenceSummary(text: string, maxSentences = 1) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, maxSentences)
    .join(' ');
}

function getMetadataString(event: TimelineEvent, key: string) {
  const value = event.metadata?.[key];
  return typeof value === 'string' ? value : '';
}

function getConsultationNote(consultation: Consultation) {
  const raw = (consultation as ConsultationWithMaybeArrayNote).clinical_note;
  if (Array.isArray(raw)) {
    return raw[raw.length - 1] ?? null;
  }
  return raw ?? null;
}

function getConsultationDate(consultation: Consultation) {
  return (
    consultation.scheduled_for ||
    consultation.completed_at ||
    consultation.started_at ||
    consultation.created_at
  );
}

function formatMedication(medication: ClinicalNote['medications'][number]) {
  return [medication.name, medication.dose, medication.frequency]
    .filter(Boolean)
    .join(' ');
}

export function PatientStorySummary({
  patient,
  consultations,
  events,
}: {
  patient?: Patient;
  consultations: Consultation[];
  events: TimelineEvent[];
}) {
  const summary = useMemo(() => {
    const orderedConsultations = [...consultations].sort(
      (a, b) =>
        new Date(getConsultationDate(b)).getTime() -
        new Date(getConsultationDate(a)).getTime()
    );

    const noteConsultations = orderedConsultations
      .map((consultation) => ({
        consultation,
        note: getConsultationNote(consultation),
      }))
      .filter(
        (
          item
        ): item is { consultation: Consultation; note: ClinicalNote } =>
          Boolean(item.note)
      );

    const latestNoteEntry =
      noteConsultations.find((item) => item.note.is_approved) || noteConsultations[0] || null;
    const previousNoteEntry =
      noteConsultations.find(
        (item) =>
          latestNoteEntry &&
          item.consultation.id !== latestNoteEntry.consultation.id &&
          item.note.is_approved
      ) ||
      noteConsultations.find(
        (item) => latestNoteEntry && item.consultation.id !== latestNoteEntry.consultation.id
      ) ||
      null;

    const latestNote = latestNoteEntry?.note ?? null;
    const previousNote = previousNoteEntry?.note ?? null;

    const latestMedications = uniqueStrings(
      (latestNote?.medications || []).map(formatMedication)
    );
    const previousMedicationMap = new Map(
      (previousNote?.medications || [])
        .filter((medication) => medication.name)
        .map((medication) => [normalizeMedicationName(medication.name), formatMedication(medication)])
    );

    const medicationChanges = uniqueStrings([
      ...(latestNote?.medications || []).flatMap((medication) => {
        if (!medication.name) {
          return [];
        }
        const key = normalizeMedicationName(medication.name);
        const current = formatMedication(medication);
        const previous = previousMedicationMap.get(key);
        if (!previous) {
          return [`Added ${current}`];
        }
        return previous !== current ? [`Adjusted ${medication.name}: ${previous} -> ${current}`] : [];
      }),
      ...(previousNote?.medications || []).flatMap((medication) => {
        if (!medication.name) {
          return [];
        }
        const key = normalizeMedicationName(medication.name);
        const stillPresent = (latestNote?.medications || []).some(
          (item) => normalizeMedicationName(item.name) === key
        );
        return stillPresent ? [] : [`Stopped ${formatMedication(medication)}`];
      }),
    ]).slice(0, 4);

    const openTaskEvents = events.filter((event) => {
      if (event.event_type !== 'task') {
        return false;
      }
      const status = getMetadataString(event, 'status');
      return status === 'open' || status === 'in_progress';
    });

    const openReferrals = uniqueStrings(
      openTaskEvents
        .filter((event) => getMetadataString(event, 'category') === 'referral')
        .map((event) => event.title)
    );
    const resultChecks = uniqueStrings(
      openTaskEvents
        .filter((event) => getMetadataString(event, 'category') === 'result_check')
        .map((event) => event.title)
    );
    const followUpLoops = uniqueStrings(
      openTaskEvents
        .filter((event) => getMetadataString(event, 'category') !== 'referral')
        .map((event) => event.title)
    );

    const draftDocuments = events.filter(
      (event) =>
        event.event_type === 'document' && getMetadataString(event, 'status') === 'draft'
    );

    const careThemes = uniqueStrings([
      ...orderedConsultations
        .map((consultation) => consultation.reason_for_visit)
        .filter(Boolean),
      ...noteConsultations
        .flatMap(({ note }) =>
          [note.content.assessment, note.content.plan]
            .map((value) => sentenceSummary(value))
            .filter(Boolean)
        ),
    ]).slice(0, 6);

    const recentTrajectory = orderedConsultations.slice(0, 4).map((consultation) => {
      const note = getConsultationNote(consultation);
      const summaryText =
        sentenceSummary(`${note?.content.assessment || ''} ${note?.content.plan || ''}`.trim()) ||
        consultation.reason_for_visit ||
        'Consultation captured for ongoing care.';

      return {
        id: consultation.id,
        title: consultation.consultation_type,
        date: getConsultationDate(consultation),
        summary: summaryText,
        status: consultation.status,
      };
    });

    // Phase 3: prefer the denormalised patients.last_appointment_at column,
    // fall back to the derived value for rows that haven't been stamped yet.
    const derivedLastVisit = orderedConsultations[0]
      ? getConsultationDate(orderedConsultations[0])
      : null;
    const lastVisitSource = patient?.last_appointment_at ?? derivedLastVisit;

    return {
      visitCount: orderedConsultations.length,
      lastVisitDate: lastVisitSource ? formatDate(lastVisitSource) : 'Not yet recorded',
      openLoopCount: openTaskEvents.length,
      draftDocumentCount: draftDocuments.length,
      latestPlan:
        sentenceSummary(latestNote?.content.plan || '', 2) ||
        'No approved plan summary is available yet.',
      activeMedications: latestMedications.slice(0, 5),
      medicationChanges,
      openReferrals: openReferrals.slice(0, 4),
      resultChecks: resultChecks.slice(0, 4),
      followUpLoops: followUpLoops.slice(0, 4),
      careThemes,
      recentTrajectory,
    };
  }, [consultations, events, patient?.last_appointment_at]);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <CardTitle>Longitudinal Summary</CardTitle>
          <CardDescription>
            Visit-to-visit snapshot of current focus, medication changes, and unresolved care loops.
          </CardDescription>
        </div>
        <Badge variant={summary.openLoopCount > 0 ? 'warning' : 'success'}>
          {summary.openLoopCount > 0
            ? `${summary.openLoopCount} open loop${summary.openLoopCount === 1 ? '' : 's'}`
            : 'No open loops'}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="rounded-xl bg-surface-container px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Visits
          </p>
          <p className="mt-2 text-2xl font-semibold text-on-surface">{summary.visitCount}</p>
          <p className="mt-1 text-sm text-on-surface-variant">Documented encounters in the story</p>
        </div>
        <div className="rounded-xl bg-surface-container px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Last Visit
          </p>
          <p className="mt-2 text-base font-semibold text-on-surface">{summary.lastVisitDate}</p>
          <p className="mt-1 text-sm text-on-surface-variant">Most recent consult on record</p>
        </div>
        <div className="rounded-xl bg-surface-container px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Follow-up Loops
          </p>
          <p className="mt-2 text-2xl font-semibold text-on-surface">{summary.openLoopCount}</p>
          <p className="mt-1 text-sm text-on-surface-variant">Open tasks still needing closure</p>
        </div>
        <div className="rounded-xl bg-surface-container px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Draft Documents
          </p>
          <p className="mt-2 text-2xl font-semibold text-on-surface">
            {summary.draftDocumentCount}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">Outputs waiting for review or send</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-surface-container-low px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-on-surface">Current Care Focus</p>
          </div>
          {summary.careThemes.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {summary.careThemes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
                >
                  {theme}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant mb-4">
              Generate more approved notes to build a longitudinal problem story.
            </p>
          )}
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2">
            Latest Plan
          </p>
          <p className="text-sm text-on-surface-variant">{summary.latestPlan}</p>
        </div>

        <div className="rounded-xl bg-surface-container-low px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-on-surface">Medication Story</p>
          </div>
          {summary.activeMedications.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {summary.activeMedications.map((medication) => (
                <span
                  key={medication}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {medication}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant mb-4">
              No active medication list has been confirmed in the latest note yet.
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className="w-4 h-4 text-on-surface-variant" />
            <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Recent Changes
            </p>
          </div>
          {summary.medicationChanges.length > 0 ? (
            <div className="space-y-2">
              {summary.medicationChanges.map((change) => (
                <p key={change} className="text-sm text-on-surface-variant">
                  {change}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              No medication additions, removals, or dose changes were detected between the latest notes.
            </p>
          )}
        </div>

        <div className="rounded-xl bg-surface-container-low px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardCheck className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-on-surface">Open Care Loops</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2">
                Referrals
              </p>
              {summary.openReferrals.length > 0 ? (
                <div className="space-y-2">
                  {summary.openReferrals.map((referral) => (
                    <p key={referral} className="text-sm text-on-surface-variant">
                      {referral}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No open referral tasks.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2">
                Results And Recalls
              </p>
              {summary.resultChecks.length > 0 || summary.followUpLoops.length > 0 ? (
                <div className="space-y-2">
                  {[...summary.resultChecks, ...summary.followUpLoops].map((item) => (
                    <p key={item} className="text-sm text-on-surface-variant">
                      {item}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No open result checks or recall tasks.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-low px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-on-surface">Recent Trajectory</p>
          </div>
          <div className="space-y-3">
            {summary.recentTrajectory.length > 0 ? (
              summary.recentTrajectory.map((item) => (
                <div key={item.id} className="rounded-lg bg-surface-container px-3 py-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{item.title}</p>
                      <p className="text-xs text-outline">{formatDate(item.date)}</p>
                    </div>
                    <Badge variant="default">{item.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant">{item.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">
                The timeline will populate as consultations, notes, and closeout work are approved.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
