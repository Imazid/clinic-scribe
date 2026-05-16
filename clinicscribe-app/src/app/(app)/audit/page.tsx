'use client';

import { useEffect, useMemo, useState } from 'react';
import { HeroStrip, HeroAccent, type HeroStripStat } from '@/components/ui/HeroStrip';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import type { AuditLog } from '@/lib/types';
import {
  Activity,
  ClipboardList,
  Download,
  FileCheck,
  FileText,
  Pill,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, LucideIcon> = {
  note_approved: Shield,
  patient_created: User,
  note_generated: FileText,
  prescription_drafted_ai: Sparkles,
  prescription_drafted: Pill,
  prescription_updated: Pill,
  prescription_approved: Shield,
  'prescription.export': Download,
  note_exported: Download,
};

type FilterId = 'all' | 'notes' | 'prescriptions' | 'exports' | 'other';

function actionCategory(action: string): FilterId {
  if (action.startsWith('note_')) return 'notes';
  if (action.startsWith('prescription_') || action === 'prescription.export') {
    return action.includes('export') ? 'exports' : 'prescriptions';
  }
  if (action.includes('export')) return 'exports';
  return 'other';
}

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'notes', label: 'Notes' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'exports', label: 'Exports' },
  { id: 'other', label: 'Other' },
];

const missingRelationCodes = new Set(['PGRST200', 'PGRST205']);

function isToday(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export default function AuditPage() {
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!clinicId) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      setLoadError(null);

      let { data, error } = await supabase
        .from('audit_logs')
        .select('*, user:profiles(*)')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error && missingRelationCodes.has(error.code)) {
        const retry = await supabase
          .from('audit_logs')
          .select('*')
          .eq('clinic_id', clinicId)
          .order('created_at', { ascending: false })
          .limit(200);
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[audit-load]', error);
        }
        setLoadError(error.message ?? 'Failed to load audit logs');
        setLogs([]);
      } else {
        setLogs((data || []) as AuditLog[]);
      }
      setLoading(false);
    }
    load();
  }, [clinicId]);

  const filterCounts = useMemo<Record<FilterId, number>>(() => {
    const acc: Record<FilterId, number> = {
      all: logs.length,
      notes: 0,
      prescriptions: 0,
      exports: 0,
      other: 0,
    };
    for (const log of logs) {
      const cat = actionCategory(log.action);
      acc[cat] += 1;
    }
    return acc;
  }, [logs]);

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (filter !== 'all' && actionCategory(log.action) !== filter) return false;
      if (!lower) return true;
      return (
        log.action.toLowerCase().includes(lower) ||
        log.entity_type.toLowerCase().includes(lower) ||
        (log.user?.first_name?.toLowerCase().includes(lower) ?? false) ||
        (log.user?.last_name?.toLowerCase().includes(lower) ?? false)
      );
    });
  }, [logs, search, filter]);

  function handleExportCSV() {
    const headers = 'Timestamp,User,Action,Entity Type,Entity ID\n';
    const rows = filtered
      .map((l) => {
        const userName = l.user ? `${l.user.first_name} ${l.user.last_name}` : l.user_id;
        return `${l.created_at},${userName},${l.action},${l.entity_type},${l.entity_id}`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const eventsToday = logs.filter((l) => isToday(l.created_at)).length;
  const distinctActions = new Set(logs.map((l) => l.action)).size;
  const distinctActors = new Set(logs.map((l) => l.user_id)).size;

  const heroStats: HeroStripStat[] = [
    {
      label: 'Total events',
      value: logs.length,
      sub: 'Last 200',
      icon: Activity,
      tone: 'default',
    },
    {
      label: 'Today',
      value: eventsToday,
      sub: eventsToday === 0 ? 'Quiet so far' : 'Recent activity',
      icon: ShieldCheck,
      tone: eventsToday > 0 ? 'success' : 'default',
    },
    {
      label: 'Action types',
      value: distinctActions,
      sub: 'Distinct',
      icon: FileCheck,
      tone: 'default',
    },
    {
      label: 'Clinicians',
      value: distinctActors,
      sub: 'Acting users',
      icon: Users,
      tone: 'default',
    },
  ];

  return (
    <div className="space-y-6">
      <HeroStrip
        eyebrow="Audit"
        title={
          <>
            Complete <HeroAccent>traceability</HeroAccent>.
          </>
        }
        description="Every action across the app — note generation, drafts, approvals, exports — recorded for compliance and incident review."
        stats={heroStats}
        actions={
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const isActive = filter === f.id;
            const count = filterCounts[f.id];
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition-colors',
                  isActive
                    ? 'border-transparent bg-primary text-on-primary'
                    : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-secondary/30 hover:text-secondary',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-on-primary/15 text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <SearchInput
          placeholder="Search action, entity, or actor…"
          value={search}
          onSearch={setSearch}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : loadError ? (
        <Card className="border border-error/30 bg-error/5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-error">
            Couldn&apos;t load audit log
          </p>
          <p className="text-sm text-on-surface">{loadError}</p>
          <p className="mt-3 text-xs text-on-surface-variant">
            If you just deployed, ensure the <code className="font-mono">audit_logs</code> table
            exists and your profile&apos;s row-level-security policy allows SELECT for{' '}
            <code className="font-mono">clinic_id</code> equality.
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={
            filter === 'all' && !search
              ? 'No audit events yet'
              : 'Nothing matches that filter'
          }
          description={
            filter === 'all' && !search
              ? 'Actions you take across the app — note generation, prescription drafts, approvals, exports — appear here automatically.'
              : 'Try a different category or clear the search.'
          }
        />
      ) : (
        <Card variant="default" className="p-0 overflow-hidden">
          {filtered.map((log, i) => {
            const Icon = actionIcons[log.action] || ClipboardList;
            const isLast = i === filtered.length - 1;
            const cat = actionCategory(log.action);
            const toneByCategory: Record<FilterId, string> = {
              all: 'text-on-surface-variant',
              notes: 'text-secondary',
              prescriptions: 'text-tertiary',
              exports: 'text-warning',
              other: 'text-on-surface-variant',
            };
            return (
              <div
                key={log.id}
                className={cn(
                  'flex items-center gap-4 px-5 py-4',
                  !isLast && 'border-b border-outline-variant/40',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low',
                    toneByCategory[cat],
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-on-surface">
                    <span className="font-semibold">
                      {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'}
                    </span>{' '}
                    <span className="text-on-surface-variant">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-outline">
                    {log.entity_type} · {formatDateTime(log.created_at)}
                  </p>
                </div>
                {log.user && (
                  <Avatar
                    firstName={log.user.first_name}
                    lastName={log.user.last_name}
                    size="sm"
                  />
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
