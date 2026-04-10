'use client';

import { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { QAFinding } from '@/lib/types';
import { AlertTriangle, ArrowLeftRight, CheckCircle2, Flag, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Resolution = 'accept_transcript' | 'keep_chart' | 'flagged';

interface DiscrepancyComparisonProps {
  findings: QAFinding[];
  onResolve?: (finding: QAFinding, resolution: Resolution) => void;
}

function getDiscrepancyFindings(findings: QAFinding[]) {
  return findings.filter((f) => f.code.startsWith('chart_discrepancy_'));
}

function parseDiscrepancySides(finding: QAFinding): { transcript: string; chart: string } {
  const detail = finding.detail || '';

  // Try to extract "transcript says X" vs "chart says Y" patterns
  const transcriptMatch = detail.match(/transcript\s+(?:says?|mentions?|states?|indicates?)[:\s]+["']?([^"'.]+)/i);
  const chartMatch = detail.match(/chart\s+(?:says?|shows?|records?|lists?|has)[:\s]+["']?([^"'.]+)/i);

  if (transcriptMatch && chartMatch) {
    return { transcript: transcriptMatch[1].trim(), chart: chartMatch[1].trim() };
  }

  // Fallback: split on common separators
  const parts = detail.split(/(?:but|however|whereas|while|yet|,\s*but)\s+/i);
  if (parts.length >= 2) {
    return { transcript: parts[0].trim(), chart: parts[1].trim() };
  }

  return { transcript: detail, chart: 'See patient chart' };
}

function DiscrepancyCard({
  finding,
  resolution,
  onResolve,
}: {
  finding: QAFinding;
  resolution?: Resolution;
  onResolve?: (resolution: Resolution) => void;
}) {
  const sides = parseDiscrepancySides(finding);
  const isResolved = !!resolution;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden transition-all',
        isResolved ? 'opacity-60' : '',
        finding.severity === 'critical' ? 'ring-1 ring-error/20' : ''
      )}
    >
      {/* Header */}
      <div className={cn(
        'px-4 py-2.5 flex items-center justify-between',
        finding.severity === 'critical' ? 'bg-error/10' : 'bg-warning/10'
      )}>
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn(
            'w-4 h-4',
            finding.severity === 'critical' ? 'text-error' : 'text-warning'
          )} />
          <span className="text-sm font-semibold text-on-surface">{finding.title}</span>
        </div>
        <Badge variant={finding.severity === 'critical' ? 'error' : 'warning'}>
          {finding.severity}
        </Badge>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/30">
        {/* Transcript side */}
        <div className="p-4 bg-secondary/3">
          <p className="label-text text-secondary mb-2">What was said</p>
          <p className="text-sm text-on-surface leading-relaxed">{sides.transcript}</p>
        </div>

        {/* Chart side */}
        <div className="p-4 bg-primary/3">
          <p className="label-text text-primary mb-2">What&apos;s on chart</p>
          <p className="text-sm text-on-surface leading-relaxed">{sides.chart}</p>
        </div>
      </div>

      {/* Suggested fix */}
      {finding.suggested_fix && (
        <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant/20">
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-secondary shrink-0" />
            {finding.suggested_fix}
          </p>
        </div>
      )}

      {/* Resolution actions */}
      {!isResolved && onResolve && (
        <div className="px-4 py-3 bg-surface-container-low border-t border-outline-variant/20 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve('accept_transcript')}
            className="text-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
            Accept transcript
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve('keep_chart')}
            className="text-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Keep chart
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResolve('flagged')}
            className="text-xs text-on-surface-variant"
          >
            <Flag className="w-3.5 h-3.5 mr-1" />
            Flag for review
          </Button>
        </div>
      )}

      {/* Resolution badge */}
      {isResolved && (
        <div className="px-4 py-2 bg-success/5 border-t border-outline-variant/20 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span className="text-xs text-success font-medium">
            {resolution === 'accept_transcript' ? 'Resolved: transcript accepted' :
             resolution === 'keep_chart' ? 'Resolved: chart kept' :
             'Flagged for further review'}
          </span>
        </div>
      )}
    </div>
  );
}

export function DiscrepancyComparison({ findings, onResolve }: DiscrepancyComparisonProps) {
  const discrepancies = getDiscrepancyFindings(findings);
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({});

  if (discrepancies.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-success" />
          <CardTitle>Chart Reconciliation</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" />
          No transcript-to-chart conflicts detected.
        </div>
      </Card>
    );
  }

  const resolvedCount = Object.keys(resolutions).length;
  const unresolvedCritical = discrepancies.filter(
    (f) => f.severity === 'critical' && !resolutions[f.code]
  ).length;

  return (
    <Card className="p-0 overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-warning" />
          <CardTitle>Chart Reconciliation</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {resolvedCount > 0 && (
            <Badge variant="success">{resolvedCount} resolved</Badge>
          )}
          <Badge variant={unresolvedCritical > 0 ? 'error' : 'warning'}>
            {discrepancies.length - resolvedCount} remaining
          </Badge>
        </div>
      </div>

      {/* Discrepancy cards */}
      <div className="divide-y divide-outline-variant/20">
        {discrepancies.map((finding) => (
          <DiscrepancyCard
            key={finding.code}
            finding={finding}
            resolution={resolutions[finding.code]}
            onResolve={(resolution) => {
              setResolutions((prev) => ({ ...prev, [finding.code]: resolution }));
              onResolve?.(finding, resolution);
            }}
          />
        ))}
      </div>
    </Card>
  );
}
