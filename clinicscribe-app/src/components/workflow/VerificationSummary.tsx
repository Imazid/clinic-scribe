'use client';

import { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { VERIFICATION_SEVERITY_LABELS } from '@/lib/constants';
import type { NoteProvenanceItem, QAFinding } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Waypoints,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  QA Scorecard — traffic-light header bar                           */
/* ------------------------------------------------------------------ */

type QAVerdict = 'pass' | 'warn' | 'fail';

function getQAVerdict(findings: QAFinding[]): { verdict: QAVerdict; label: string } {
  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  if (criticalCount > 0) return { verdict: 'fail', label: `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''}` };
  if (warningCount > 2) return { verdict: 'warn', label: `${warningCount} warnings` };
  if (warningCount > 0) return { verdict: 'warn', label: `${warningCount} warning${warningCount > 1 ? 's' : ''}` };
  return { verdict: 'pass', label: 'All checks passed' };
}

const VERDICT_STYLES: Record<QAVerdict, { bg: string; icon: string; text: string }> = {
  pass: { bg: 'bg-success/10', icon: 'text-success', text: 'text-success' },
  warn: { bg: 'bg-warning/10', icon: 'text-warning', text: 'text-warning' },
  fail: { bg: 'bg-error/10', icon: 'text-error', text: 'text-error' },
};

export function QAScorecard({ findings }: { findings: QAFinding[] }) {
  const { verdict, label } = getQAVerdict(findings);
  const style = VERDICT_STYLES[verdict];
  const counts = findings.reduce(
    (acc, f) => { acc[f.severity] += 1; return acc; },
    { critical: 0, warning: 0, info: 0 }
  );

  return (
    <div className={cn('rounded-xl px-4 py-3 flex items-center justify-between gap-4', style.bg)}>
      <div className="flex items-center gap-3">
        {verdict === 'pass' ? (
          <ShieldCheck className={cn('w-5 h-5', style.icon)} />
        ) : (
          <AlertTriangle className={cn('w-5 h-5', style.icon)} />
        )}
        <span className={cn('text-sm font-semibold', style.text)}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {counts.critical > 0 && <Badge variant="error">{counts.critical} critical</Badge>}
        {counts.warning > 0 && <Badge variant="warning">{counts.warning} warnings</Badge>}
        {counts.info > 0 && <Badge variant="default">{counts.info} info</Badge>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Provenance Summary                                                */
/* ------------------------------------------------------------------ */

export function ProvenanceSummary({
  provenance,
}: {
  provenance: NoteProvenanceItem[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (provenance.length === 0) return null;

  const sourceOrder = ['needs_review', 'inferred', 'chart', 'imported_result', 'transcript'] as const;
  const sourceLabels: Record<string, string> = {
    transcript: 'Transcript',
    chart: 'Chart',
    imported_result: 'Results',
    inferred: 'AI Inference',
    needs_review: 'Needs Review',
  };
  const sourceCounts = provenance.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.source] = (accumulator[item.source] || 0) + 1;
    return accumulator;
  }, {});

  const needsReviewItems = provenance.filter((p) => p.source === 'needs_review' || p.source === 'inferred');
  const displayItems = expanded ? provenance : needsReviewItems.slice(0, 5);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Waypoints className="w-5 h-5 text-secondary" />
          <CardTitle>Fact Provenance</CardTitle>
        </div>
        <span className="text-xs text-on-surface-variant">
          {provenance.length} sentence{provenance.length !== 1 ? 's' : ''} traced
        </span>
      </div>

      {/* Source counts grid */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-2 mb-4">
        {sourceOrder.map((source) => (
          <div
            key={source}
            className={cn(
              'rounded-xl px-3 py-3',
              source === 'needs_review' && (sourceCounts[source] ?? 0) > 0
                ? 'bg-error/5 ring-1 ring-error/20'
                : source === 'inferred' && (sourceCounts[source] ?? 0) > 0
                  ? 'bg-warning/5'
                  : 'bg-surface-container-low'
            )}
          >
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">
              {sourceLabels[source]}
            </p>
            <p className="mt-1 text-xl font-semibold text-on-surface">
              {sourceCounts[source] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Items list (prioritized: needs_review + inferred first) */}
      {displayItems.length > 0 && (
        <div className="space-y-2">
          {displayItems.map((item, i) => (
            <div key={`${item.section}-${i}`} className="rounded-xl bg-surface-container-low px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={item.source === 'needs_review' ? 'warning' : item.source === 'inferred' ? 'default' : 'info'}>
                    {item.source.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {item.section}
                  </span>
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  item.confidence >= 0.9 ? 'text-success' :
                  item.confidence >= 0.7 ? 'text-on-surface-variant' : 'text-error'
                )}>
                  {Math.round(item.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm text-on-surface">{item.sentence}</p>
              <p className="text-xs text-on-surface-variant mt-1">{item.rationale}</p>
            </div>
          ))}
        </div>
      )}

      {provenance.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-secondary font-medium hover:underline"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Show less' : `Show all ${provenance.length} items`}
        </button>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  QA Finding Summary — interactive resolve / dismiss                */
/* ------------------------------------------------------------------ */

export function QAFindingSummary({
  findings,
  resolvedCodes,
  onResolve,
  onDismiss,
  onEditSection,
  onRecheck,
  isRechecking,
  contentEdited,
}: {
  findings: QAFinding[];
  resolvedCodes?: Set<string>;
  onResolve?: (finding: QAFinding) => void;
  onDismiss?: (finding: QAFinding) => void;
  onEditSection?: (section: string) => void;
  onRecheck?: () => void;
  isRechecking?: boolean;
  contentEdited?: boolean;
}) {
  const [confirmingCode, setConfirmingCode] = useState<string | null>(null);
  const resolved = resolvedCodes ?? new Set<string>();
  const unresolvedFindings = findings.filter((f) => !resolved.has(f.code));
  const resolvedFindings = findings.filter((f) => resolved.has(f.code));
  const counts = unresolvedFindings.reduce(
    (acc, f) => { acc[f.severity] += 1; return acc; },
    { critical: 0, warning: 0, info: 0 }
  );

  function handleResolve(finding: QAFinding) {
    if (finding.severity === 'critical' && confirmingCode !== finding.code) {
      setConfirmingCode(finding.code);
      return;
    }
    setConfirmingCode(null);
    onResolve?.(finding);
  }

  function handleDismiss(finding: QAFinding) {
    onDismiss?.(finding);
  }

  if (findings.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-success" />
          <CardTitle>Safety Check</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" />
          No safety flags were raised in the current QA pass.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {unresolvedFindings.length === 0 ? (
            <ShieldCheck className="w-5 h-5 text-success" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning" />
          )}
          <CardTitle>Safety Check</CardTitle>
        </div>
        {resolved.size > 0 && (
          <span className="text-xs text-success font-medium">{resolved.size} resolved</span>
        )}
      </div>

      {/* Severity summary bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={counts.critical > 0 ? 'error' : 'success'}>
          {counts.critical} critical
        </Badge>
        <Badge variant={counts.warning > 0 ? 'warning' : 'default'}>
          {counts.warning} warnings
        </Badge>
        <Badge variant={counts.info > 0 ? 'info' : 'default'}>
          {counts.info} info
        </Badge>
      </div>

      {counts.critical > 0 && (
        <div className="rounded-xl bg-error/5 px-4 py-3 text-sm text-error mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Approval is blocked until the critical findings are resolved.
        </div>
      )}

      {/* Unresolved findings */}
      <div className="space-y-3">
        {unresolvedFindings.map((finding) => (
          <div
            key={finding.code}
            className={cn(
              'rounded-xl px-4 py-3 transition-colors',
              finding.severity === 'critical' ? 'bg-error/5 ring-1 ring-error/20' :
              finding.severity === 'warning' ? 'bg-warning/5' :
              'bg-surface-container-low'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={
                    finding.severity === 'critical' ? 'error' :
                    finding.severity === 'warning' ? 'warning' : 'default'
                  }
                >
                  {VERIFICATION_SEVERITY_LABELS[finding.severity]}
                </Badge>
                {finding.section && (
                  <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {finding.section.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onEditSection && finding.section && finding.section !== 'overall' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSection(finding.section!)}
                    className="text-xs h-7 px-2 text-secondary"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit & Fix
                  </Button>
                )}
                {onResolve && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolve(finding)}
                    className={cn(
                      'text-xs h-7 px-2',
                      confirmingCode === finding.code && 'bg-error/10 text-error'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {confirmingCode === finding.code ? 'Confirm resolve' : 'Resolve'}
                  </Button>
                )}
                {finding.severity !== 'critical' && onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(finding)}
                    className="text-xs h-7 px-2 text-on-surface-variant"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
            {/* Confirmation message for critical findings */}
            {confirmingCode === finding.code && (
              <div className="rounded-lg bg-error/5 px-3 py-2 mb-2 text-xs text-error">
                This is a critical finding. Click &quot;Confirm resolve&quot; again to acknowledge you have reviewed and addressed it.
              </div>
            )}
            <p className="text-sm font-semibold text-on-surface">{finding.title}</p>
            <p className="text-sm text-on-surface-variant mt-1">{finding.detail}</p>
            {finding.suggested_fix && (
              <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                {finding.suggested_fix}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Resolved findings (collapsed) */}
      {resolvedFindings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <p className="text-xs font-medium text-on-surface-variant mb-2">
            {resolvedFindings.length} resolved finding{resolvedFindings.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {resolvedFindings.map((finding) => (
              <div
                key={finding.code}
                className="rounded-xl bg-surface-container-low/50 px-4 py-2.5 opacity-60"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span className="text-sm text-on-surface-variant line-through">{finding.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All resolved success message */}
      {unresolvedFindings.length === 0 && resolvedFindings.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-success mt-4">
          <CheckCircle2 className="w-4 h-4" />
          All findings have been reviewed and resolved.
        </div>
      )}

      {/* Re-check button after edits */}
      {onRecheck && contentEdited && unresolvedFindings.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRecheck}
          isLoading={isRechecking}
          className="mt-4 w-full"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Re-check Safety
        </Button>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Discrepancy Summary                                               */
/* ------------------------------------------------------------------ */

function getDiscrepancyFindings(findings: QAFinding[]) {
  return findings.filter((finding) => finding.code.startsWith('chart_discrepancy_'));
}

export function DiscrepancySummary({
  findings,
  onResolve,
}: {
  findings: QAFinding[];
  onResolve?: (finding: QAFinding) => void;
}) {
  const discrepancyFindings = getDiscrepancyFindings(findings);
  const criticalCount = discrepancyFindings.filter((f) => f.severity === 'critical').length;

  if (discrepancyFindings.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-success" />
          <CardTitle>Chart Reconciliation</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" />
          No transcript-to-chart conflicts were detected.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <CardTitle>Chart Reconciliation</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={criticalCount > 0 ? 'error' : 'warning'}>
            {discrepancyFindings.length} conflict{discrepancyFindings.length === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {discrepancyFindings.map((finding) => (
          <div
            key={finding.code}
            className={cn(
              'rounded-xl px-4 py-3',
              finding.severity === 'critical' ? 'bg-error/5 ring-1 ring-error/20' : 'bg-warning/5'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={finding.severity === 'critical' ? 'error' : 'warning'}
                >
                  {VERIFICATION_SEVERITY_LABELS[finding.severity]}
                </Badge>
                {finding.section && (
                  <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {finding.section.replace('_', ' ')}
                  </span>
                )}
              </div>
              {onResolve && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResolve(finding)}
                  className="text-xs h-7 px-2"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> Investigate
                </Button>
              )}
            </div>
            <p className="text-sm font-semibold text-on-surface">{finding.title}</p>
            <p className="text-sm text-on-surface-variant mt-1">{finding.detail}</p>
            {finding.suggested_fix && (
              <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                {finding.suggested_fix}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
