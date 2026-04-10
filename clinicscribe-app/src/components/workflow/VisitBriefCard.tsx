'use client';

import { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Consultation, VisitBrief } from '@/lib/types';
import { getWorkflowPackByTemplateKey } from '@/lib/workflow/packs';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  FileText,
  FileWarning,
  FlaskConical,
  HelpCircle,
  Layers3,
  Pill,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitBriefCardProps {
  consultation: Consultation;
  brief?: VisitBrief | null;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

function getContextList(brief: VisitBrief | null | undefined, key: string) {
  const value = brief?.source_context?.[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
}

function getBriefFreshness(brief: VisitBrief | null | undefined): { label: string; variant: 'info' | 'warning' | 'default' } {
  if (!brief) return { label: 'Brief Needed', variant: 'default' };
  const createdAt = new Date(brief.created_at);
  const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 24) return { label: 'Fresh', variant: 'info' };
  return { label: 'Stale — Regenerate', variant: 'warning' };
}

function getTimeSinceLastVisit(brief: VisitBrief | null | undefined): string | null {
  const latestNoteAt = brief?.source_context?.latest_note_at;
  if (!latestNoteAt || typeof latestNoteAt !== 'string') return null;
  const date = new Date(latestNoteAt);
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(daysAgo / 30)} month${Math.floor(daysAgo / 30) > 1 ? 's' : ''} ago`;
}

/* Collapsible section with icon, count badge, and urgency coloring */
function BriefSection({
  icon: Icon,
  title,
  items,
  urgency = 'default',
  defaultExpanded = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  urgency?: 'default' | 'warning' | 'error';
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (items.length === 0) return null;

  const bgColor = urgency === 'error' ? 'bg-error/5' : urgency === 'warning' ? 'bg-warning/5' : 'bg-surface-container-low';
  const iconColor = urgency === 'error' ? 'text-error' : urgency === 'warning' ? 'text-warning' : 'text-secondary';
  const countBg = urgency === 'error' ? 'bg-error/10 text-error' : urgency === 'warning' ? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary';

  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant/20">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn('w-full flex items-center justify-between px-4 py-2.5 transition-colors', bgColor)}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', iconColor)} />
          <span className="text-sm font-semibold text-on-surface">{title}</span>
          <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', countBg)}>
            {items.length}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
      </button>
      {expanded && (
        <div className="px-4 py-3 space-y-1.5 bg-surface-container-lowest">
          {items.map((item, i) => (
            <div key={i} className={cn('text-sm text-on-surface-variant rounded-lg px-3 py-2', bgColor)}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Agenda checklist — items clinician can tick during consult */
function AgendaChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  if (items.length === 0) return null;

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }

  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant/20">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/5">
        <ClipboardList className="w-4 h-4 text-secondary" />
        <span className="text-sm font-semibold text-on-surface">Likely Agenda</span>
        <span className="text-xs text-on-surface-variant ml-auto">
          {checked.size}/{items.length} addressed
        </span>
      </div>
      <div className="px-4 py-3 space-y-2 bg-surface-container-lowest">
        {items.map((item, i) => (
          <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() => toggle(i)}
              className="mt-0.5 w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary/30"
            />
            <span className={cn(
              'text-sm leading-relaxed transition-colors',
              checked.has(i) ? 'text-on-surface-variant line-through opacity-60' : 'text-on-surface'
            )}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function VisitBriefCard({
  consultation,
  brief,
  onGenerate,
  isGenerating,
}: VisitBriefCardProps) {
  const patientName = consultation.patient
    ? `${consultation.patient.first_name} ${consultation.patient.last_name}`
    : 'Unknown patient';
  const scheduledFor = consultation.scheduled_for
    ? formatDate(consultation.scheduled_for)
    : null;
  const lastVisitSummary = getContextList(brief, 'last_visit_summary');
  const activeMedications = getContextList(brief, 'active_medications');
  const unresolvedReferrals = getContextList(brief, 'unresolved_referrals');
  const chartDeltas = getContextList(brief, 'chart_deltas');
  const dataGaps = getContextList(brief, 'data_gaps');
  const workflowPack = getWorkflowPackByTemplateKey(consultation.template_key);
  const freshness = getBriefFreshness(brief);
  const timeSinceLastVisit = getTimeSinceLastVisit(brief);

  const urgentItemCount =
    (brief?.abnormal_results?.length ?? 0) +
    (brief?.unresolved_items?.length ?? 0) +
    chartDeltas.length;

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-secondary" />
            <CardTitle className="text-base">{patientName}</CardTitle>
          </div>
          <p className="text-sm text-on-surface-variant">
            {consultation.consultation_type}
            {consultation.reason_for_visit ? ` · ${consultation.reason_for_visit}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {scheduledFor && (
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <Clock className="w-3 h-3" /> {scheduledFor}
              </span>
            )}
            {timeSinceLastVisit && (
              <span className="text-xs text-on-surface-variant">
                · Last visit: {timeSinceLastVisit}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {urgentItemCount > 0 && brief && (
            <span className="flex items-center gap-1 text-xs font-medium text-error bg-error/10 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" /> {urgentItemCount} attention
            </span>
          )}
          <Badge variant={freshness.variant}>{freshness.label}</Badge>
        </div>
      </div>

      {/* Workflow pack context */}
      {workflowPack && (
        <div className="rounded-xl bg-secondary/5 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers3 className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-on-surface">{workflowPack.title}</p>
          </div>
          <p className="text-xs text-on-surface-variant">{workflowPack.description}</p>
        </div>
      )}

      {brief ? (
        <>
          {/* Summary block */}
          <div className="rounded-xl bg-secondary/5 px-4 py-3 text-sm text-on-surface">
            {brief.summary}
          </div>

          {/* Quick context cards */}
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-secondary" />
                <p className="text-sm font-semibold text-on-surface">Last Visit</p>
              </div>
              <p className="text-sm text-on-surface-variant">
                {lastVisitSummary[0] || 'No prior approved visit summary available.'}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-low px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-secondary" />
                <p className="text-sm font-semibold text-on-surface">Medications</p>
              </div>
              {activeMedications.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {activeMedications.slice(0, 4).map((med) => (
                    <span key={med} className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                      {med}
                    </span>
                  ))}
                  {activeMedications.length > 4 && (
                    <span className="text-xs text-on-surface-variant">+{activeMedications.length - 4} more</span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No active medication list recovered.</p>
              )}
            </div>
            <div className={cn(
              'rounded-xl px-4 py-3',
              (brief.abnormal_results?.length ?? 0) > 0 ? 'bg-error/5 ring-1 ring-error/20' : 'bg-surface-container-low'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className={cn('w-4 h-4', (brief.abnormal_results?.length ?? 0) > 0 ? 'text-error' : 'text-secondary')} />
                <p className="text-sm font-semibold text-on-surface">Results</p>
              </div>
              {(brief.abnormal_results?.length ?? 0) > 0 ? (
                <div className="space-y-1">
                  {brief.abnormal_results.slice(0, 3).map((r) => (
                    <p key={r} className="text-sm text-error">{r}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No linked abnormal results.</p>
              )}
            </div>
          </div>

          {/* Agenda checklist */}
          <AgendaChecklist items={brief.likely_agenda} />

          {/* Collapsible sections */}
          <div className="space-y-2">
            <BriefSection icon={FileWarning} title="Unresolved Items" items={brief.unresolved_items} urgency="warning" defaultExpanded={brief.unresolved_items.length <= 3} />
            <BriefSection icon={Stethoscope} title="Active Problems" items={brief.active_problems} defaultExpanded={brief.active_problems.length <= 4} />
            <BriefSection icon={Pill} title="Medication Changes" items={brief.medication_changes} urgency={brief.medication_changes.length > 0 ? 'warning' : 'default'} />
            <BriefSection icon={AlertTriangle} title="Chart Deltas" items={chartDeltas} urgency={chartDeltas.length > 0 ? 'error' : 'default'} />
            <BriefSection icon={HelpCircle} title="Clarify Today" items={brief.clarification_questions} />
            <BriefSection icon={FileWarning} title="Data Gaps" items={dataGaps} urgency={dataGaps.length > 0 ? 'warning' : 'default'} />
          </div>
        </>
      ) : (
        <div className="rounded-xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-outline" />
          No visit brief generated yet. Generate one to prepare for the consultation.
        </div>
      )}

      {/* Generate button */}
      {onGenerate && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onGenerate} isLoading={isGenerating}>
            <Sparkles className="w-4 h-4" /> {brief ? 'Refresh Brief' : 'Generate Brief'}
          </Button>
        </div>
      )}
    </Card>
  );
}
