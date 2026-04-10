import type {
  CareTask,
  ClinicalNote,
  Consultation,
  FollowUpTask,
  GeneratedDocument,
  MedicationDraft,
  NoteProvenanceItem,
  Patient,
  PatientSummary,
  QAFinding,
  SOAPNote,
  TimelineEvent,
  VisitBrief,
} from '@/lib/types';

type ConsultationWithArtifacts = Consultation & {
  clinical_note?: ClinicalNote | ClinicalNote[] | null;
};

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function getLatestApprovedNote(consultations: ConsultationWithArtifacts[]) {
  const notes = consultations
    .flatMap((consultation) => {
      const raw = consultation.clinical_note;
      const note = Array.isArray(raw) ? raw[raw.length - 1] : raw ?? null;
      return note && note.is_approved ? [note] : [];
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return notes[0] ?? null;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getLatestApprovedEncounter(consultations: ConsultationWithArtifacts[]) {
  const encounters = consultations
    .flatMap((consultation) => {
      const raw = consultation.clinical_note;
      const note = Array.isArray(raw) ? raw[raw.length - 1] : raw ?? null;
      return note && note.is_approved ? [{ consultation, note }] : [];
    })
    .sort(
      (a, b) =>
        new Date(b.note.updated_at).getTime() - new Date(a.note.updated_at).getTime()
    );

  return encounters[0] ?? null;
}

function sentenceSummary(text: string, maxSentences = 2) {
  return splitSentences(text).slice(0, maxSentences).join(' ');
}

function buildPatientInstructionChannelVariants(patientSummary: PatientSummary) {
  const print = [
    patientSummary.heading,
    '',
    patientSummary.plain_language_summary,
    patientSummary.medication_changes.length > 0 ? '\nMedication changes:' : '',
    ...patientSummary.medication_changes.map((change) => `- ${change}`),
    patientSummary.next_steps.length > 0 ? '\nWhat to do next:' : '',
    ...patientSummary.next_steps.map((step) => `- ${step}`),
    patientSummary.seek_help.length > 0 ? '\nGet urgent help if:' : '',
    ...patientSummary.seek_help.map((flag) => `- ${flag}`),
  ]
    .filter(Boolean)
    .join('\n');

  const email = [
    `Subject: ${patientSummary.heading}`,
    '',
    'Summary of today’s visit',
    patientSummary.plain_language_summary,
    patientSummary.next_steps.length > 0 ? '\nNext steps:' : '',
    ...patientSummary.next_steps.map((step) => `- ${step}`),
    patientSummary.medication_changes.length > 0 ? '\nMedication changes:' : '',
    ...patientSummary.medication_changes.map((change) => `- ${change}`),
    patientSummary.seek_help.length > 0 ? '\nPlease seek urgent care if:' : '',
    ...patientSummary.seek_help.map((flag) => `- ${flag}`),
  ]
    .filter(Boolean)
    .join('\n');

  const sms = [
    `Visit summary: ${patientSummary.plain_language_summary}`,
    patientSummary.next_steps.length > 0
      ? `Next: ${patientSummary.next_steps.slice(0, 2).join('; ')}`
      : '',
    patientSummary.seek_help.length > 0
      ? `Urgent help if: ${patientSummary.seek_help.slice(0, 1).join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { print, email, sms };
}

function buildPatientFamilyEmail(patientSummary: PatientSummary) {
  return [
    `Subject: ${patientSummary.heading}`,
    '',
    'Hello,',
    '',
    'Here is a plain-language update from today’s consultation for the patient and their family or carers.',
    '',
    patientSummary.plain_language_summary,
    patientSummary.key_points.length > 0 ? '\nWhat was discussed:' : '',
    ...patientSummary.key_points.map((point) => `- ${point}`),
    patientSummary.medication_changes.length > 0 ? '\nMedication changes:' : '',
    ...patientSummary.medication_changes.map((change) => `- ${change}`),
    patientSummary.next_steps.length > 0 ? '\nNext steps:' : '',
    ...patientSummary.next_steps.map((step) => `- ${step}`),
    patientSummary.seek_help.length > 0 ? '\nPlease seek urgent medical help if:' : '',
    ...patientSummary.seek_help.map((flag) => `- ${flag}`),
    '',
    'Kind regards,',
    'Miraa clinical team draft',
  ]
    .filter(Boolean)
    .join('\n');
}

function signalMatches(text: string, matcher: RegExp) {
  return splitSentences(text).filter((sentence) => matcher.test(sentence));
}

function sentenceOverlap(sentence: string, transcript: string) {
  const sentenceTokens = normalize(sentence).split(/\s+/).filter((token) => token.length > 2);
  if (sentenceTokens.length === 0) return 0;

  const transcriptTokens = new Set(normalize(transcript).split(/\s+/).filter(Boolean));
  const shared = sentenceTokens.filter((token) => transcriptTokens.has(token)).length;
  return shared / sentenceTokens.length;
}

export function buildVisitBriefArtifact(params: {
  consultation: Consultation;
  patient: Patient;
  priorConsultations: ConsultationWithArtifacts[];
  openTasks: CareTask[];
}) {
  const { consultation, patient, priorConsultations, openTasks } = params;
  const latestEncounter = getLatestApprovedEncounter(priorConsultations);
  const latestApprovedNote = latestEncounter?.note ?? getLatestApprovedNote(priorConsultations);
  const activeProblems = uniqueStrings(patient.conditions);
  const activeMedications = uniqueStrings(
    (latestApprovedNote?.medications || [])
      .filter((medication) => medication.verified || medication.name)
      .map((medication) =>
        [medication.name, medication.dose, medication.frequency].filter(Boolean).join(' ')
      )
  );
  const resultWatchlist = uniqueStrings([
    ...openTasks
      .filter((task) => task.category === 'result_check')
      .map((task) => task.title || task.description),
    ...signalMatches(
      latestApprovedNote?.content.objective || '',
      /\b(hba1c|creatinine|egfr|potassium|sodium|lab|result|test|imaging|scan)\b/i
    ),
  ]);
  const unresolvedReferrals = uniqueStrings([
    ...openTasks
      .filter((task) => task.category === 'referral')
      .map((task) => task.title || task.description),
    ...(latestApprovedNote?.referrals || []),
  ]);
  const unresolvedItems = uniqueStrings([
    ...openTasks.map((task) => task.title),
    ...(latestApprovedNote?.follow_up_tasks || [])
      .filter((task) => !task.completed)
      .map((task) => task.description),
    ...unresolvedReferrals,
  ]);
  const latestNoteText = normalize(
    [
      latestApprovedNote?.content.subjective || '',
      latestApprovedNote?.content.objective || '',
      latestApprovedNote?.content.assessment || '',
      latestApprovedNote?.content.plan || '',
    ].join(' ')
  );
  const chartDeltas = uniqueStrings([
    patient.allergies.length === 0
      ? 'Chart allergy list is blank; confirm NKDA or document active allergies before sign-off.'
      : '',
    activeProblems.length === 0
      ? 'Chart problem list is empty; confirm the active diagnoses driving today’s visit.'
      : '',
    latestApprovedNote && latestNoteText
      ? patient.conditions
          .filter((condition) => !latestNoteText.includes(normalize(condition)))
          .slice(0, 2)
          .map((condition) => `Problem list item not clearly reflected in the last note: ${condition}.`)
      : [],
    latestApprovedNote && latestNoteText
      ? patient.allergies
          .filter((allergy) => !latestNoteText.includes(normalize(allergy)))
          .slice(0, 2)
          .map((allergy) => `Charted allergy not referenced in the last note: ${allergy}.`)
      : [],
    latestApprovedNote && activeMedications.length === 0
      ? 'Latest approved note does not contain a reconciled active medication list.'
      : '',
    latestApprovedNote ? '' : 'No approved prior note is available to compare against the chart yet.',
  ].flat());
  const likelyAgenda = uniqueStrings([
    consultation.reason_for_visit || consultation.consultation_type,
    ...resultWatchlist.slice(0, 1),
    ...unresolvedReferrals.slice(0, 1),
    ...chartDeltas.slice(0, 1),
    ...unresolvedItems.slice(0, 2),
  ]);
  const lastVisitSummary = latestEncounter
    ? uniqueStrings([
        `${latestEncounter.consultation.consultation_type}: ${
          sentenceSummary(
            `${latestEncounter.note.content.assessment} ${latestEncounter.note.content.plan}`
          ) || 'Prior consult note available for review.'
        }`,
      ])
    : [];
  const dataGaps = uniqueStrings([
    resultWatchlist.length === 0
      ? 'No imported result feed is connected yet; confirm whether external labs or imaging need review.'
      : '',
    activeMedications.length === 0
      ? 'No active medication list was recovered from the last approved note.'
      : '',
    latestEncounter ? '' : 'No prior approved visit summary is available yet.',
  ]);

  const clarificationQuestions = uniqueStrings([
    patient.allergies.length === 0 ? 'Confirm allergy status before finalising the plan.' : '',
    patient.consent_status !== 'granted' ? 'Confirm current recording and documentation consent.' : '',
    openTasks.length > 0 ? 'Review whether prior follow-up items were completed.' : '',
    unresolvedReferrals.length > 0
      ? 'Check whether outstanding referrals have been booked, acknowledged, or completed.'
      : '',
    resultWatchlist.length > 0
      ? 'Confirm whether recent abnormal or pending results were reviewed with the patient.'
      : '',
  ]);

  const summaryParts = [
    `Prepare for a ${consultation.consultation_type.toLowerCase()} with ${patient.first_name} ${patient.last_name}.`,
    lastVisitSummary.length > 0
      ? `Last visit: ${lastVisitSummary[0]}`
      : 'No prior approved visit summary is available yet.',
    activeProblems.length > 0
      ? `Known problems: ${activeProblems.slice(0, 3).join(', ')}.`
      : 'No active problem list is recorded yet.',
    activeMedications.length > 0
      ? `Active medications to verify: ${activeMedications.slice(0, 3).join(', ')}.`
      : 'No active medications were recovered from prior approved notes.',
    resultWatchlist.length > 0
      ? `Result follow-up to review: ${resultWatchlist.slice(0, 2).join(', ')}.`
      : 'No recent abnormal lab or result follow-up items are currently linked.',
    unresolvedReferrals.length > 0
      ? `Outstanding referrals: ${unresolvedReferrals.slice(0, 2).join(', ')}.`
      : '',
    chartDeltas.length > 0
      ? `Chart deltas to review: ${chartDeltas.slice(0, 2).join(' ')}`
      : '',
    unresolvedItems.length > 0
      ? `Unresolved items to close: ${unresolvedItems.slice(0, 3).join(', ')}.`
      : 'No unresolved follow-up items are currently tracked.',
  ];

  return {
    status: 'ready' as const,
    summary: summaryParts.join(' '),
    active_problems: activeProblems,
    medication_changes: activeMedications,
    abnormal_results: resultWatchlist,
    unresolved_items: unresolvedItems,
    likely_agenda: likelyAgenda,
    clarification_questions: clarificationQuestions,
    source_context: {
      prior_consultations: priorConsultations.length,
      open_task_count: openTasks.length,
      latest_note_at: latestApprovedNote?.updated_at || null,
      last_visit_summary: lastVisitSummary,
      active_medications: activeMedications,
      unresolved_referrals: unresolvedReferrals,
      result_watchlist: resultWatchlist,
      chart_deltas: chartDeltas,
      data_gaps: dataGaps,
    },
  } satisfies Omit<
    VisitBrief,
    'id' | 'clinic_id' | 'patient_id' | 'consultation_id' | 'generated_at' | 'created_at' | 'updated_at'
  >;
}

function chartMatches(sentence: string, patient: Patient) {
  const values = [...patient.conditions, ...patient.allergies, patient.mrn || '']
    .map(normalize)
    .filter(Boolean);
  const normalizedSentence = normalize(sentence);
  return values.some((value) => value && normalizedSentence.includes(value));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasNegatedMention(text: string, phrase: string) {
  const normalizedPhrase = phrase.trim();
  if (!normalizedPhrase) return false;

  const escapedPhrase = escapeRegExp(normalizedPhrase).replace(/\s+/g, '\\s+');
  const patterns = [
    new RegExp(`\\b(?:no|not|without|denies|deny|never had)\\s+(?:any\\s+)?${escapedPhrase}\\b`, 'i'),
    new RegExp(`\\b${escapedPhrase}\\b[^.\\n]{0,20}\\b(?:not present|negative|denied)\\b`, 'i'),
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function normalizeDose(dose: string) {
  return normalize(dose).replace(/\s+/g, ' ').trim();
}

function extractDoseMention(text: string, medicationName: string) {
  const escapedMedication = escapeRegExp(medicationName.trim()).replace(/\s+/g, '\\s+');
  const dosePattern = '(\\d+(?:\\.\\d+)?\\s?(?:mg|mcg|g|ml|units))';
  const patterns = [
    new RegExp(`\\b${escapedMedication}\\b[^.\\n]{0,30}?\\b${dosePattern}\\b`, 'i'),
    new RegExp(`\\b${dosePattern}\\b[^.\\n]{0,30}?\\b${escapedMedication}\\b`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function buildProvenanceMap(params: {
  note: Pick<ClinicalNote, 'content' | 'confidence_scores'>;
  transcript: string;
  patient: Patient | null;
}) {
  const { note, transcript, patient } = params;
  const sections: Array<keyof SOAPNote> = ['subjective', 'objective', 'assessment', 'plan'];
  const provenance: NoteProvenanceItem[] = [];

  sections.forEach((section) => {
    splitSentences(note.content[section]).forEach((sentence) => {
      const overlap = sentenceOverlap(sentence, transcript);
      const sentenceLower = sentence.toLowerCase();

      if (sentence.includes('[UNCLEAR]') || note.confidence_scores[section] < 0.65) {
        provenance.push({
          section,
          sentence,
          source: 'needs_review',
          rationale: 'This sentence contains uncertainty or comes from a low-confidence section.',
          confidence: 0.4,
        });
        return;
      }

      if (patient && chartMatches(sentence, patient)) {
        provenance.push({
          section,
          sentence,
          source: 'chart',
          rationale: 'This statement matches structured chart context already on file.',
          confidence: 0.86,
        });
        return;
      }

      if (overlap >= 0.45 || transcript.toLowerCase().includes(sentenceLower.slice(0, 24))) {
        provenance.push({
          section,
          sentence,
          source: 'transcript',
          rationale: 'This statement is well supported by the consultation transcript.',
          confidence: 0.9,
        });
        return;
      }

      if (/(possible|likely|consider|suggest|may|appears)/i.test(sentence)) {
        provenance.push({
          section,
          sentence,
          source: 'inferred',
          rationale: 'This statement reads as a clinical inference rather than a direct quote.',
          confidence: 0.64,
        });
        return;
      }

      provenance.push({
        section,
        sentence,
        source: 'needs_review',
        rationale: 'The support for this statement is not obvious from the transcript or chart context.',
        confidence: 0.52,
      });
    });
  });

  return provenance;
}

export function buildQAFindings(params: {
  note: Pick<
    ClinicalNote,
    'content' | 'confidence_scores' | 'medications' | 'follow_up_tasks' | 'provenance_map'
  >;
  patient: Patient | null;
  transcript?: string;
  latestApprovedNote?: Pick<ClinicalNote, 'medications'> | null;
}) {
  const { note, patient, transcript = '', latestApprovedNote = null } = params;
  const findings: QAFinding[] = [];

  if (!note.content.assessment.trim()) {
    findings.push({
      code: 'missing_assessment',
      title: 'Assessment is missing',
      detail: 'Add a clinician assessment before final approval.',
      severity: 'critical',
      section: 'assessment',
      suggested_fix: 'Document the working diagnosis or differential.',
    });
  }

  if (!note.content.plan.trim()) {
    findings.push({
      code: 'missing_plan',
      title: 'Plan is missing',
      detail: 'The note does not yet contain a clear plan.',
      severity: 'critical',
      section: 'plan',
      suggested_fix: 'Add treatment actions, follow-up, or monitoring.',
    });
  }

  if (note.follow_up_tasks.length === 0) {
    findings.push({
      code: 'follow_up_missing',
      title: 'No tracked follow-up items',
      detail: 'Consider extracting follow-up tasks so the consult can move into closeout.',
      severity: 'warning',
      section: 'follow_up',
      suggested_fix: 'Add due dates or explicit next actions.',
    });
  }

  if (note.medications.some((medication) => !medication.verified)) {
    findings.push({
      code: 'unverified_medications',
      title: 'Medication drafts still need verification',
      detail: 'At least one medication remains marked as draft only.',
      severity: 'warning',
      section: 'medications',
      suggested_fix: 'Verify dose, frequency, and quantity before sign-off.',
    });
  }

  const medicationDoseConflicts = Array.from(
    note.medications.reduce((accumulator, medication) => {
      const key = normalize(medication.name);
      if (!key) return accumulator;
      const doses = accumulator.get(key) ?? new Set<string>();
      if (medication.dose) doses.add(normalize(medication.dose));
      accumulator.set(key, doses);
      return accumulator;
    }, new Map<string, Set<string>>())
  )
    .filter(([, doses]) => Array.from(doses).filter(Boolean).length > 1)
    .map(([name]) => name);

  if (medicationDoseConflicts.length > 0) {
    findings.push({
      code: 'medication_dose_mismatch',
      title: 'Potential medication dose mismatch',
      detail: `The note includes more than one dose for ${medicationDoseConflicts.join(', ')}.`,
      severity: 'critical',
      section: 'medications',
      suggested_fix: 'Confirm the intended dose and remove duplicate or conflicting entries.',
    });
  }

  if (
    !note.follow_up_tasks.some((task) => Boolean(task.due_date)) &&
    !/\b(day|days|week|weeks|month|months)\b/i.test(note.content.plan)
  ) {
    findings.push({
      code: 'follow_up_timing_unclear',
      title: 'Follow-up timing is unclear',
      detail: 'The plan does not include a clear follow-up window.',
      severity: 'warning',
      section: 'plan',
      suggested_fix: 'Specify when the patient should be reviewed or tested again.',
    });
  }

  if (
    signalMatches(note.content.objective, /\b(hba1c|creatinine|egfr|potassium|sodium|lab|result|test)\b/i)
      .length > 0 &&
    !note.follow_up_tasks.some((task) =>
      /\b(result|lab|test|repeat|recheck|monitor)\b/i.test(task.description)
    ) &&
    !/\b(repeat|recheck|review|monitor)\b.*\b(result|lab|test)\b/i.test(note.content.plan)
  ) {
    findings.push({
      code: 'result_follow_up_missing',
      title: 'Result follow-up is not explicit',
      detail: 'Objective findings reference tests or results, but the plan does not clearly assign result follow-up.',
      severity: 'warning',
      section: 'plan',
      suggested_fix: 'Add a repeat test, review interval, or result check task.',
    });
  }

  if (note.confidence_scores.overall < 0.8) {
    findings.push({
      code: 'confidence_low',
      title: 'Overall confidence is below the review threshold',
      detail: 'This note needs a slower clinician review before approval.',
      severity: 'warning',
      section: 'overall',
    });
  }

  const unsupportedSentences = note.provenance_map.filter(
    (item) => item.source === 'needs_review'
  ).length;
  if (unsupportedSentences > 0) {
    findings.push({
      code: 'unsupported_sentences',
      title: 'Some note sentences need confirmation',
      detail: `${unsupportedSentences} sentence${unsupportedSentences === 1 ? '' : 's'} could not be confidently tied to transcript or chart context.`,
      severity: unsupportedSentences > 2 ? 'critical' : 'warning',
      section: 'overall',
      suggested_fix: 'Edit or confirm the flagged statements before approving the note.',
    });
  }

  const inferredSentences = note.provenance_map.filter(
    (item) => item.source === 'inferred'
  ).length;
  if (inferredSentences > 2) {
    findings.push({
      code: 'heavy_inference_load',
      title: 'Several note statements are AI inferences',
      detail: `${inferredSentences} sentences are marked as inferred rather than directly supported by transcript or chart context.`,
      severity: 'warning',
      section: 'overall',
      suggested_fix: 'Confirm the inferred statements or replace them with directly supported facts.',
    });
  }

  if (patient?.allergies.length && !/allerg/i.test(`${note.content.objective} ${note.content.plan}`)) {
    findings.push({
      code: 'allergy_context_missing',
      title: 'Allergy context is not referenced',
      detail: 'The patient has recorded allergies, but the note does not mention any medication safety context.',
      severity: 'info',
      section: 'medications',
    });
  }

  if (
    patient?.allergies.length &&
    /\b(nkda|no known drug allergies|no allergies)\b/i.test(
      `${note.content.subjective} ${note.content.objective} ${note.content.assessment} ${note.content.plan}`
    )
  ) {
    findings.push({
      code: 'allergy_contradiction',
      title: 'Recorded allergies conflict with the note',
      detail: 'The patient has charted allergies, but the note states there are none.',
      severity: 'critical',
      section: 'medications',
      suggested_fix: 'Reconcile the allergy list and update the note wording before sign-off.',
    });
  }

  if (transcript) {
    const transcriptSaysNoAllergies = /\b(nkda|no known drug allergies|no allergies)\b/i.test(
      transcript
    );

    if (patient?.allergies.length && transcriptSaysNoAllergies) {
      findings.push({
        code: 'chart_discrepancy_allergy_denial',
        title: 'Transcript denies charted allergies',
        detail: `The chart lists allergies (${patient.allergies.join(', ')}), but the consult transcript suggests there are no known allergies.`,
        severity: 'critical',
        section: 'medications',
        suggested_fix: 'Confirm the current allergy status and update the note or chart before sign-off.',
      });
    }

    if (!patient?.allergies.length) {
      const transcriptAllergyMention = transcript.match(
        /\b(?:allergic to|allergy to)\s+([a-z0-9\s-]{2,40})/i
      );

      if (transcriptAllergyMention?.[1]) {
        findings.push({
          code: 'chart_discrepancy_allergy_missing',
          title: 'Transcript mentions an allergy missing from the chart',
          detail: `The transcript mentions "${transcriptAllergyMention[1].trim()}" as an allergy, but no allergy is recorded in the chart context.`,
          severity: 'warning',
          section: 'medications',
          suggested_fix: 'Confirm the allergy and update the charted allergy list if correct.',
        });
      }
    }

    const deniedConditions = (patient?.conditions || []).filter((condition) =>
      hasNegatedMention(transcript, condition)
    );

    if (deniedConditions.length > 0) {
      findings.push({
        code: 'chart_discrepancy_problem_list',
        title: 'Transcript conflicts with the charted problem list',
        detail: `The consult transcript appears to deny charted conditions: ${deniedConditions.join(', ')}.`,
        severity: 'warning',
        section: 'overall',
        suggested_fix: 'Confirm whether the problem list is stale or whether the transcript needs correction.',
      });
    }
  }

  if (latestApprovedNote?.medications?.length) {
    const priorMedicationMap = new Map(
      latestApprovedNote.medications
        .filter((medication) => medication.name && medication.dose)
        .map((medication) => [normalize(medication.name), medication] as const)
    );

    const noteMedicationDiscrepancies = note.medications
      .map((medication) => {
        const priorMedication = priorMedicationMap.get(normalize(medication.name));
        if (!priorMedication?.dose || !medication.dose) return null;
        if (normalizeDose(priorMedication.dose) === normalizeDose(medication.dose)) return null;

        return {
          name: medication.name,
          chartDose: priorMedication.dose,
          noteDose: medication.dose,
        };
      })
      .filter((item): item is { name: string; chartDose: string; noteDose: string } => Boolean(item));

    noteMedicationDiscrepancies.slice(0, 3).forEach((discrepancy, index) => {
      findings.push({
        code: `chart_discrepancy_medication_note_${index}`,
        title: 'Current note medication dose differs from chart history',
        detail: `${discrepancy.name} is charted at ${discrepancy.chartDose}, but the current note lists ${discrepancy.noteDose}.`,
        severity: 'warning',
        section: 'medications',
        suggested_fix: 'Confirm whether the dose changed today and reconcile the chart once verified.',
      });
    });

    if (transcript) {
      Array.from(priorMedicationMap.values())
        .map((priorMedication, index) => {
          const transcriptDose = extractDoseMention(transcript, priorMedication.name);
          if (!transcriptDose || !priorMedication.dose) return null;
          if (normalizeDose(transcriptDose) === normalizeDose(priorMedication.dose)) return null;

          return {
            code: `chart_discrepancy_medication_transcript_${index}`,
            title: 'Transcript medication dose differs from chart history',
            detail: `${priorMedication.name} is charted at ${priorMedication.dose}, but the transcript mentions ${transcriptDose}.`,
            severity: 'warning' as const,
            section: 'medications' as const,
            suggested_fix: 'Confirm whether this is an intentional dose change and update the medication list after review.',
          };
        })
        .filter(
          (
            item
          ): item is {
            code: string;
            title: string;
            detail: string;
            severity: 'warning';
            section: 'medications';
            suggested_fix: string;
          } => Boolean(item)
        )
        .slice(0, 3)
        .forEach((item) => findings.push(item));
    }
  }

  const assessmentTerms = new Set(
    normalize(note.content.assessment)
      .split(/\s+/)
      .filter((term) => term.length > 4)
  );
  const planTerms = new Set(
    normalize(note.content.plan)
      .split(/\s+/)
      .filter((term) => term.length > 4)
  );
  const sharedAssessmentPlanTerms = Array.from(assessmentTerms).filter((term) =>
    planTerms.has(term)
  );

  if (
    note.content.assessment.trim() &&
    note.content.plan.trim() &&
    sharedAssessmentPlanTerms.length === 0
  ) {
    findings.push({
      code: 'diagnosis_plan_link_missing',
      title: 'Assessment and plan are weakly linked',
      detail: 'The treatment plan does not clearly tie back to the documented assessment.',
      severity: 'warning',
      section: 'plan',
      suggested_fix: 'Make the diagnosis-to-plan linkage explicit for the main problem list.',
    });
  }

  return findings;
}

export function buildPatientSummary(params: {
  patient: Patient;
  note: Pick<ClinicalNote, 'content' | 'medications' | 'follow_up_tasks' | 'referrals'>;
}) {
  const { patient, note } = params;
  const assessmentSummary = sentenceSummary(note.content.assessment, 1);
  const planSummary = sentenceSummary(note.content.plan, 1);
  const keyPoints = uniqueStrings([
    ...splitSentences(note.content.assessment).slice(0, 2),
    ...splitSentences(note.content.plan)
      .filter((sentence) => /\b(start|stop|continue|monitor|review|follow up|repeat|book|arrange)\b/i.test(sentence))
      .slice(0, 2),
  ]);
  const nextSteps = uniqueStrings([
    ...note.follow_up_tasks.map((task) => task.description),
    ...note.referrals.map((referral) => referral),
    ...splitSentences(note.content.plan).filter((sentence) =>
      /\b(review|follow up|repeat|book|arrange|monitor|check|return|call)\b/i.test(sentence)
    ),
  ]).slice(0, 5);
  const medicationChanges = uniqueStrings(
    note.medications.map((medication) =>
      [medication.name, medication.dose, medication.frequency].filter(Boolean).join(' ')
    )
  );
  const seekHelp = uniqueStrings([
    /\b(chest pain|shortness of breath|breathless)\b/i.test(
      `${note.content.subjective} ${note.content.assessment} ${note.content.plan}`
    )
      ? 'Seek urgent care for chest pain, severe shortness of breath, or rapidly worsening breathing.'
      : '',
    /\b(fever|rigor|infection)\b/i.test(
      `${note.content.subjective} ${note.content.assessment} ${note.content.plan}`
    )
      ? 'Get urgent review if fevers, rigors, or signs of infection develop or worsen.'
      : '',
    /\b(urine|kidney|fluid overload|swelling|weight gain)\b/i.test(
      `${note.content.subjective} ${note.content.assessment} ${note.content.plan}`
    )
      ? 'Seek medical advice quickly if urine output drops, swelling worsens, or fluid symptoms increase.'
      : '',
    /\b(dizziness|collapse|syncope|faint)\b/i.test(
      `${note.content.subjective} ${note.content.assessment} ${note.content.plan}`
    )
      ? 'Seek urgent review for fainting, collapse, or severe dizziness.'
      : '',
    'Seek urgent care if symptoms suddenly worsen or you have any concerning new symptoms.',
  ]).slice(0, 4);

  return {
    heading: `After-visit summary for ${patient.first_name} ${patient.last_name}`,
    plain_language_summary: assessmentSummary
      ? `${assessmentSummary}${planSummary ? ` ${planSummary}` : ''}`
      : planSummary || 'Your care plan was reviewed and the next steps were documented for follow-up.',
    key_points: keyPoints,
    medication_changes: medicationChanges,
    next_steps:
      nextSteps.length > 0
        ? nextSteps
        : splitSentences(note.content.plan).slice(0, 3),
    seek_help: seekHelp,
    language: 'en',
    reading_level: 'plain_english',
  } satisfies PatientSummary;
}

function inferTaskCategory(task: FollowUpTask | { description: string }) {
  const description = task.description.toLowerCase();
  if (description.includes('referral')) return 'referral' as const;
  if (description.includes('lab') || description.includes('result') || description.includes('test')) {
    return 'result_check' as const;
  }
  if (description.includes('med') || description.includes('dose')) return 'medication_review' as const;
  if (description.includes('education')) return 'patient_education' as const;
  return 'follow_up' as const;
}

function parseDueDate(dateValue: string | null) {
  if (!dateValue) return null;
  const timestamp = Date.parse(dateValue);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function extractRelativeDueDate(text: string) {
  const lower = text.toLowerCase();
  const now = new Date();

  if (/\btomorrow\b/.test(lower)) {
    const nextDay = new Date(now);
    nextDay.setDate(now.getDate() + 1);
    return nextDay.toISOString();
  }

  const relativeMatch = lower.match(
    /\b(?:in|within|after)\s+(\d+)\s*(day|days|week|weeks|month|months|hour|hours)\b/
  );

  if (!relativeMatch) return null;

  const value = Number(relativeMatch[1]);
  const unit = relativeMatch[2];
  const dueDate = new Date(now);

  if (unit.startsWith('hour')) {
    dueDate.setHours(dueDate.getHours() + value);
  } else if (unit.startsWith('day')) {
    dueDate.setDate(dueDate.getDate() + value);
  } else if (unit.startsWith('week')) {
    dueDate.setDate(dueDate.getDate() + value * 7);
  } else if (unit.startsWith('month')) {
    dueDate.setMonth(dueDate.getMonth() + value);
  }

  return dueDate.toISOString();
}

function inferPlanFollowUpTasks(
  planText: string,
  existingTasks: FollowUpTask[],
  referrals: string[]
) {
  const existingDescriptions = new Set(
    uniqueStrings([
      ...existingTasks.map((task) => normalize(task.description)),
      ...referrals.map((referral) => normalize(referral)),
    ])
  );

  return splitSentences(planText)
    .filter((sentence) =>
      /\b(follow[\s-]?up|review|repeat|recheck|result|lab|test|referral|monitor|arrange|book|return|counsel|education)\b/i.test(
        sentence
      )
    )
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter((sentence) => sentence.length > 0)
    .filter((sentence) => !existingDescriptions.has(normalize(sentence)))
    .map((sentence) => ({
      description: sentence,
      due_date: extractRelativeDueDate(sentence),
      category: inferTaskCategory({ description: sentence }),
    }));
}

export function materializeCareTasks(params: {
  clinicId: string;
  patientId: string;
  consultationId: string;
  noteId: string;
  ownerUserId?: string | null;
  planText: string;
  followUpTasks: FollowUpTask[];
  referrals: string[];
}) {
  const {
    clinicId,
    patientId,
    consultationId,
    noteId,
    ownerUserId = null,
    planText,
    followUpTasks,
    referrals,
  } = params;
  const inferredTasks = inferPlanFollowUpTasks(planText, followUpTasks, referrals);
  const tasks = followUpTasks.map((task) => ({
    clinic_id: clinicId,
    patient_id: patientId,
    consultation_id: consultationId,
    note_id: noteId,
    title: task.description,
    description: task.description,
    due_at: parseDueDate(task.due_date),
    status: task.completed ? ('completed' as const) : ('open' as const),
    category: inferTaskCategory(task),
    owner_user_id: ownerUserId,
    source: 'note_plan',
    metadata: {
      generated_from: 'ai_note',
      task_origin: 'follow_up_tasks',
    },
  }));

  const inferredPlanTasks = inferredTasks.map((task) => ({
    clinic_id: clinicId,
    patient_id: patientId,
    consultation_id: consultationId,
    note_id: noteId,
    title: task.description,
    description: task.description,
    due_at: parseDueDate(task.due_date),
    status: 'open' as const,
    category: task.category,
    owner_user_id: ownerUserId,
    source: 'note_plan',
    metadata: {
      generated_from: 'ai_note',
      task_origin: 'plan_inference',
    },
  }));

  const referralTasks = referrals.map((referral) => ({
    clinic_id: clinicId,
    patient_id: patientId,
    consultation_id: consultationId,
    note_id: noteId,
    title: referral,
    description: referral,
    due_at: null,
    status: 'open' as const,
    category: 'referral' as const,
    owner_user_id: ownerUserId,
    source: 'referral_draft',
    metadata: {
      generated_from: 'ai_note',
      task_origin: 'referrals',
    },
  }));

  return [...tasks, ...inferredPlanTasks, ...referralTasks];
}

export function buildGeneratedDocuments(params: {
  clinicId: string;
  patientId: string;
  consultationId: string;
  noteId: string;
  note: Pick<ClinicalNote, 'content' | 'referrals' | 'medications' | 'follow_up_tasks'>;
  patientSummary: PatientSummary;
}) {
  const { clinicId, patientId, consultationId, noteId, note, patientSummary } = params;
  const patientSummaryContent = [
    patientSummary.heading,
    '',
    patientSummary.plain_language_summary,
    patientSummary.key_points.length > 0 ? '\nKey points:' : '',
    ...patientSummary.key_points.map((point) => `- ${point}`),
    patientSummary.medication_changes.length > 0 ? '\nMedication changes:' : '',
    ...patientSummary.medication_changes.map((change) => `- ${change}`),
    patientSummary.next_steps.length > 0 ? '\nNext steps:' : '',
    ...patientSummary.next_steps.map((step) => `- ${step}`),
    patientSummary.seek_help.length > 0 ? '\nGet help urgently if:' : '',
    ...patientSummary.seek_help.map((flag) => `- ${flag}`),
  ]
    .filter(Boolean)
    .join('\n');
  const instructionVariants = buildPatientInstructionChannelVariants(patientSummary);
  const patientInstructionsContent = instructionVariants.print;
  const patientFamilyEmailContent = buildPatientFamilyEmail(patientSummary);
  const hasResultReminder = note.follow_up_tasks.some((task) =>
    /\b(result|lab|test|repeat|recheck|monitor)\b/i.test(task.description)
  );
  const needsWorkCertificate = /\b(certificate|medical certificate|sick leave|unfit for work|workcover|workers comp)\b/i.test(
    `${note.content.assessment} ${note.content.plan}`
  );

  const documents: Array<
    Omit<GeneratedDocument, 'id' | 'created_at' | 'updated_at' | 'patient' | 'consultation'>
  > = [
    {
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'patient_summary' as const,
      title: 'Internal patient summary',
      status: 'ready' as const,
      content: patientSummaryContent,
      metadata: { ...patientSummary },
    },
    {
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'patient_instructions' as const,
      title: 'Patient instructions draft',
      status: 'draft' as const,
      content: patientInstructionsContent,
      metadata: {
        channel_options: ['print', 'sms', 'email'],
        channel_variants: instructionVariants,
        email_subject: patientSummary.heading,
        language: patientSummary.language,
        reading_level: patientSummary.reading_level,
      },
    },
    {
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'patient_family_email' as const,
      title: 'Patient & family email draft',
      status: 'draft' as const,
      content: patientFamilyEmailContent,
      metadata: {
        channel_options: ['email'],
        audience: ['patient', 'family', 'carer'],
        email_subject: patientSummary.heading,
        language: patientSummary.language,
        reading_level: patientSummary.reading_level,
        generated_from: 'patient_summary',
      },
    },
    {
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'visit_summary' as const,
      title: 'Visit summary',
      status: 'ready' as const,
      content: [
        `Subjective: ${note.content.subjective}`,
        `Objective: ${note.content.objective}`,
        `Assessment: ${note.content.assessment}`,
        `Plan: ${note.content.plan}`,
      ].join('\n\n'),
      metadata: {},
    },
  ];

  if (note.follow_up_tasks.length > 0) {
    documents.push({
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'follow_up_letter' as const,
      title: 'Follow-up letter draft',
      status: 'draft' as const,
      content: [
        'Follow-up plan',
        '',
        ...note.follow_up_tasks.map((task) =>
          `- ${task.description}${task.due_date ? ` (Due ${task.due_date})` : ''}`
        ),
      ].join('\n'),
      metadata: {
        generated_from: 'follow_up_tasks',
        channel_options: ['print', 'email'],
      },
    });
  }

  if (hasResultReminder) {
    documents.push({
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'result_reminder' as const,
      title: 'Result reminder draft',
      status: 'draft' as const,
      content: [
        'Results and monitoring reminder',
        '',
        ...note.follow_up_tasks
          .filter((task) => /\b(result|lab|test|repeat|recheck|monitor)\b/i.test(task.description))
          .map((task) => `- ${task.description}${task.due_date ? ` (Due ${task.due_date})` : ''}`),
      ].join('\n'),
      metadata: {
        generated_from: 'result_follow_up',
        channel_options: ['sms', 'email'],
      },
    });
  }

  if (note.referrals.length > 0) {
    documents.push({
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'referral_letter' as const,
      title: 'Referral draft',
      status: 'draft' as const,
      content: note.referrals.join('\n'),
      metadata: {
        channel_options: ['print', 'email'],
      },
    });
  }

  if (needsWorkCertificate) {
    documents.push({
      clinic_id: clinicId,
      patient_id: patientId,
      consultation_id: consultationId,
      note_id: noteId,
      kind: 'work_certificate' as const,
      title: 'Work certificate draft',
      status: 'draft' as const,
      content: [
        'Work certificate draft',
        '',
        'Reason for certificate:',
        sentenceSummary(`${note.content.assessment} ${note.content.plan}`, 2) ||
          'Review clinician note and confirm certificate wording.',
      ].join('\n'),
      metadata: {
        generated_from: 'note_content',
        channel_options: ['print'],
      },
    });
  }

  return documents;
}

export function buildTimelineEvents(params: {
  clinicId: string;
  patientId: string;
  consultations: ConsultationWithArtifacts[];
  careTasks: CareTask[];
  documents: GeneratedDocument[];
}) {
  const { clinicId, patientId, consultations, careTasks, documents } = params;
  const consultationEvents: TimelineEvent[] = consultations.map((consultation) => ({
    id: `consultation-${consultation.id}`,
    clinic_id: clinicId,
    patient_id: patientId,
    consultation_id: consultation.id,
    event_type: 'consultation',
    title: consultation.consultation_type,
    summary: consultation.reason_for_visit || 'Consultation recorded.',
    event_date: consultation.scheduled_for || consultation.created_at,
    metadata: { status: consultation.status },
    created_at: consultation.created_at,
  }));

  const taskEvents: TimelineEvent[] = careTasks.map((task) => ({
    id: `task-${task.id}`,
    clinic_id: clinicId,
    patient_id: patientId,
    consultation_id: task.consultation_id,
    event_type: 'task',
    title: task.title,
    summary: task.description,
    event_date: task.due_at || task.created_at,
    metadata: { status: task.status, category: task.category },
    created_at: task.created_at,
  }));

  const documentEvents: TimelineEvent[] = documents.map((document) => ({
    id: `document-${document.id}`,
    clinic_id: clinicId,
    patient_id: patientId,
    consultation_id: document.consultation_id,
    event_type: 'document',
    title: document.title,
    summary: document.kind,
    event_date: document.created_at,
    metadata: { status: document.status, kind: document.kind },
    created_at: document.created_at,
  }));

  return [...consultationEvents, ...taskEvents, ...documentEvents].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );
}

export function summarizeMedicationList(medications: MedicationDraft[]) {
  return uniqueStrings(
    medications.map((medication) =>
      [medication.name, medication.dose, medication.frequency].filter(Boolean).join(' ')
    )
  );
}
