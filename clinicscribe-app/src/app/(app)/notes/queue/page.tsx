'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { HeroStrip, HeroAccent, type HeroStripStat } from '@/components/ui/HeroStrip';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { getVerificationQueue } from '@/lib/api/workflow';
import type { Consultation, QAFinding } from '@/lib/types';
import { cn } from '@/lib/utils';

type QueueTab = 'all' | 'critical' | 'warnings' | 'ready';

function getLatestNote(c: Consultation) {
  const note = c.clinical_note;
  if (Array.isArray(note)) return note[note.length - 1];
  return note ?? null;
}

function getFindings(c: Consultation): QAFinding[] {
  const note = getLatestNote(c);
  return ((note?.qa_findings as QAFinding[] | undefined) ?? []).filter((f) => !f.resolved);
}

function severity(c: Consultation): 'critical' | 'warnings' | 'ready' {
  const findings = getFindings(c);
  if (findings.some((f) => f.severity === 'critical')) return 'critical';
  if (findings.some((f) => f.severity === 'warning')) return 'warnings';
  return 'ready';
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone = pct >= 85 ? 'success' : pct >= 60 ? 'warning' : 'error';
  const fill =
    tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : 'bg-error';
  const text =
    tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-error';
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
      <Sparkles className={cn('h-3 w-3', text)} />
      <span className={text}>{pct}%</span>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-container">
        <div className={cn('h-full', fill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function NotesQueuePage() {
  const profile = useAuthStore((s) => s.profile);
  const addToast = useUIStore((s) => s.addToast);
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<QueueTab>('all');

  useEffect(() => {
    async function load() {
      if (!profile?.clinic_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getVerificationQueue(profile.clinic_id);
        setQueue(data);
      } catch (error) {
        console.error('[notes-queue]', error);
        addToast(
          error instanceof Error ? error.message : 'Failed to load review queue',
          'error',
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast, profile?.clinic_id]);

  const buckets = useMemo(() => {
    const acc = { all: queue, critical: [] as Consultation[], warnings: [] as Consultation[], ready: [] as Consultation[] };
    for (const c of queue) {
      acc[severity(c)].push(c);
    }
    return acc;
  }, [queue]);

  const visible = buckets[tab];

  const stats: HeroStripStat[] = [
    {
      label: 'In queue',
      value: buckets.all.length,
      sub: 'Awaiting sign-off',
      icon: ShieldCheck,
      tone: 'default',
    },
    {
      label: 'Critical',
      value: buckets.critical.length,
      sub: buckets.critical.length === 0 ? 'Clear' : 'Block approval',
      icon: AlertTriangle,
      tone: buckets.critical.length > 0 ? 'error' : 'default',
    },
    {
      label: 'Warnings',
      value: buckets.warnings.length,
      sub: buckets.warnings.length === 0 ? 'None' : 'To review',
      icon: ShieldCheck,
      tone: buckets.warnings.length > 0 ? 'warning' : 'default',
    },
    {
      label: 'Ready',
      value: buckets.ready.length,
      sub: buckets.ready.length === 0 ? 'None' : 'Approve & close',
      icon: CheckCircle2,
      tone: 'success',
    },
  ];

  const tabs: Array<{ id: QueueTab; label: string; count: number }> = [
    { id: 'all', label: 'All', count: buckets.all.length },
    { id: 'critical', label: 'Critical', count: buckets.critical.length },
    { id: 'warnings', label: 'Warnings', count: buckets.warnings.length },
    { id: 'ready', label: 'Ready', count: buckets.ready.length },
  ];

  return (
    <div className="space-y-8">
      <HeroStrip
        eyebrow="Sign-off queue"
        title={
          <>
            <HeroAccent>Nothing</HeroAccent> leaves the system without you.
          </>
        }
        description="Review AI-drafted notes, resolve flags, sign off. Built to support clinical documentation, not replace clinician judgement."
        stats={stats}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-transparent bg-primary text-on-primary'
                  : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-secondary/30 hover:text-secondary',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  isActive
                    ? 'bg-on-primary/15 text-on-primary'
                    : t.id === 'critical' && t.count > 0
                      ? 'bg-error/15 text-error'
                      : t.id === 'warnings' && t.count > 0
                        ? 'bg-warning/15 text-warning'
                        : t.id === 'ready' && t.count > 0
                          ? 'bg-success/15 text-success'
                          : 'bg-surface-container-high text-on-surface-variant',
                )}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={
            tab === 'all'
              ? 'No notes awaiting review'
              : tab === 'critical'
                ? 'No critical flags'
                : tab === 'warnings'
                  ? 'No warnings'
                  : 'Nothing ready to approve yet'
          }
          description="When AI-drafted notes need your sign-off, they appear here."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((c) => {
            const note = getLatestNote(c);
            const findings = getFindings(c);
            const critical = findings.filter((f) => f.severity === 'critical').length;
            const warnings = findings.filter((f) => f.severity === 'warning').length;
            const conf = note?.confidence_scores?.overall ?? 0;
            const sev = severity(c);

            const sevTone =
              sev === 'critical' ? 'error' : sev === 'warnings' ? 'warning' : 'success';
            const sevText =
              sev === 'critical'
                ? `${critical} critical flag${critical === 1 ? '' : 's'}`
                : sev === 'warnings'
                  ? `${warnings} warning${warnings === 1 ? '' : 's'}`
                  : 'Ready to approve';

            const summary = note?.content?.assessment || note?.content?.subjective || 'AI-drafted clinical note awaiting review.';

            return (
              <Link
                key={c.id}
                href={`/consultations/${c.id}/review`}
                className="group block"
              >
                <Card
                  variant="default"
                  className={cn(
                    'flex items-start gap-4 transition-shadow hover:shadow-ambient',
                    sev === 'critical' && 'ring-1 ring-error/20',
                    sev === 'warnings' && 'ring-1 ring-warning/20',
                  )}
                >
                  {c.patient ? (
                    <Avatar
                      firstName={c.patient.first_name}
                      lastName={c.patient.last_name}
                      size="lg"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container">
                      <ShieldCheck className="h-5 w-5 text-on-surface-variant" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-on-surface">
                        {c.patient
                          ? `${c.patient.first_name} ${c.patient.last_name}`
                          : 'Consultation'}
                      </h3>
                      <span className="text-xs text-outline">·</span>
                      <span className="text-xs text-on-surface-variant">
                        {c.consultation_type}
                      </span>
                      <Badge variant={sevTone} className="gap-1">
                        {sev === 'critical' && <AlertTriangle className="h-3 w-3" />}
                        {sevText}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                      {summary}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <ConfidenceBar value={conf} />
                      <span className="text-xs text-outline">
                        {relativeTime(c.updated_at ?? c.created_at)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-outline transition-transform group-hover:translate-x-0.5" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
