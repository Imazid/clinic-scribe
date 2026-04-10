'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import {
  EVIDENCE_SCOPE_LABELS,
} from '@/lib/constants';
import {
  getEvidenceQueries,
  queryEvidence,
  updateEvidenceQueryStatus,
} from '@/lib/api/workflow';
import { useUIStore } from '@/lib/stores/ui-store';
import type {
  EvidenceAnswer,
  EvidenceQueryScope,
  QAFinding,
  SOAPNote,
  WorkflowPackPrompt,
} from '@/lib/types';
import { BookOpenText, CheckCircle2, Link2, Sparkles } from 'lucide-react';

interface EvidencePanelProps {
  consultationId: string;
  profileId?: string | null;
  note: SOAPNote;
  findings: QAFinding[];
  extraPrompts?: WorkflowPackPrompt[];
}

interface EvidencePrompt {
  id: string;
  question: string;
  scope: EvidenceQueryScope;
  linkedFinding?: QAFinding | null;
  label?: string;
}

function getFindingScope(finding: QAFinding): EvidenceQueryScope {
  if (finding.code.startsWith('chart_discrepancy_')) return 'chart_reconciliation';
  if (
    finding.code.includes('follow_up') ||
    finding.code.includes('result') ||
    finding.code.includes('referral')
  ) {
    return 'follow_up';
  }

  return 'qa_resolution';
}

function buildPromptSet(findings: QAFinding[], extraPrompts: WorkflowPackPrompt[] = []) {
  const defaults: EvidencePrompt[] = [
    {
      id: 'med-reconciliation',
      question: 'What evidence-backed reconciliation steps should the clinician follow for the medication and allergy issues in this consult?',
      scope: 'chart_reconciliation',
    },
    {
      id: 'follow-up-interval',
      question: 'What should the clinician confirm about monitoring intervals, repeat testing, and closeout timing for this consult?',
      scope: 'follow_up',
    },
    {
      id: 'patient-instructions',
      question: 'What should the patient instructions emphasise for medicines, next steps, and red flags after this visit?',
      scope: 'patient_instructions',
    },
  ];

  const findingPrompts = findings
    .filter((finding) => finding.severity !== 'info')
    .slice(0, 4)
    .map((finding) => ({
      id: finding.code,
      question: `What evidence-backed guidance should the clinician use to resolve this issue: ${finding.title}?`,
      scope: getFindingScope(finding),
      linkedFinding: finding,
    }));

  const packPrompts = extraPrompts.map((prompt) => ({
    id: prompt.id,
    question: prompt.question,
    scope: prompt.scope,
    label: prompt.label,
  }));

  const unique = new Map<string, EvidencePrompt>();
  [...findingPrompts, ...packPrompts, ...defaults].forEach((prompt) => {
    unique.set(prompt.id, prompt);
  });

  return Array.from(unique.values());
}

export function EvidencePanel({
  consultationId,
  profileId,
  note,
  findings,
  extraPrompts = [],
}: EvidencePanelProps) {
  const addToast = useUIStore((state) => state.addToast);
  const [answers, setAnswers] = useState<EvidenceAnswer[]>([]);
  const [loadingPromptId, setLoadingPromptId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const prompts = useMemo(() => buildPromptSet(findings, extraPrompts), [extraPrompts, findings]);

  const load = useCallback(async () => {
    try {
      const result = await getEvidenceQueries(consultationId);
      setAnswers(result.evidence_queries || []);
    } catch (error) {
      console.error(error);
    }
  }, [consultationId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePromptClick(prompt: EvidencePrompt) {
    setLoadingPromptId(prompt.id);

    try {
      const result = await queryEvidence(consultationId, {
        question: prompt.question,
        scope: prompt.scope,
        linkedFindingCode: prompt.linkedFinding?.code || null,
        note,
        finding: prompt.linkedFinding || null,
        createdBy: profileId || null,
      });

      setAnswers((current) => [result.evidence_query, ...current]);
      addToast('Evidence answer generated', 'success');
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to generate evidence answer',
        'error'
      );
    } finally {
      setLoadingPromptId(null);
    }
  }

  async function handleAccept(answer: EvidenceAnswer) {
    if (answer.status === 'accepted') return;

    if (answer.id.startsWith('temp-')) {
      setAnswers((current) =>
        current.map((item) =>
          item.id === answer.id
            ? {
                ...item,
                status: 'accepted',
                accepted_by: profileId || null,
                accepted_at: new Date().toISOString(),
              }
            : item
        )
      );
      return;
    }

    setAcceptingId(answer.id);

    try {
      const result = await updateEvidenceQueryStatus(consultationId, {
        id: answer.id,
        status: 'accepted',
        acceptedBy: profileId || null,
      });

      setAnswers((current) =>
        current.map((item) =>
          item.id === answer.id
            ? { ...item, ...result.evidence_query, status: 'accepted' }
            : item
        )
      );
      addToast('Evidence answer accepted', 'success');
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to accept evidence answer',
        'error'
      );
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <BookOpenText className="w-5 h-5 text-secondary" />
        <CardTitle>Evidence Shortcuts</CardTitle>
      </div>

      <p className="text-sm text-on-surface-variant mb-4">
        Generate citation-backed answers from clinic-approved sources for QA flags,
        chart conflicts, and patient-instruction drafting.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {prompts.map((prompt) => (
          <Button
            key={prompt.id}
            variant="outline"
            size="sm"
            isLoading={loadingPromptId === prompt.id}
            onClick={() => handlePromptClick(prompt)}
          >
            <Sparkles className="w-4 h-4" />
            {prompt.linkedFinding
              ? prompt.linkedFinding.title
              : prompt.label || EVIDENCE_SCOPE_LABELS[prompt.scope]}
          </Button>
        ))}
      </div>

      {answers.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
          No evidence answers yet. Use a shortcut above to generate a reviewed answer with citations linked to this consult.
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((answer) => (
            <div key={answer.id} className="rounded-xl bg-surface-container-low px-4 py-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="info">{EVIDENCE_SCOPE_LABELS[answer.scope]}</Badge>
                <Badge variant={answer.status === 'accepted' ? 'success' : 'default'}>
                  {answer.status === 'accepted' ? 'Accepted' : 'Draft'}
                </Badge>
                {answer.linked_finding_code ? (
                  <Badge variant="warning">{answer.linked_finding_code}</Badge>
                ) : null}
              </div>

              <p className="text-sm font-semibold text-on-surface">{answer.question}</p>
              <p className="text-sm text-on-surface-variant mt-2 whitespace-pre-wrap">
                {answer.answer}
              </p>

              {answer.key_points.length > 0 ? (
                <div className="mt-3 space-y-1">
                  {answer.key_points.map((point) => (
                    <div key={`${answer.id}-${point}`} className="text-sm text-on-surface">
                      - {point}
                    </div>
                  ))}
                </div>
              ) : null}

              {answer.citations.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {answer.citations.map((citation) => (
                    <a
                      key={`${answer.id}-${citation.id}`}
                      href={citation.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-outline-variant px-3 py-3 hover:bg-surface-container"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 className="w-4 h-4 text-secondary" />
                        <p className="text-sm font-semibold text-on-surface">
                          {citation.title}
                        </p>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {citation.organisation} · {citation.topic}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {citation.summary}
                      </p>
                    </a>
                  ))}
                </div>
              ) : null}

              {answer.status !== 'accepted' ? (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={acceptingId === answer.id}
                    onClick={() => handleAccept(answer)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept answer
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
