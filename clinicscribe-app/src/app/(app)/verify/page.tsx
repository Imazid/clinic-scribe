'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfidenceIndicator } from '@/components/notes/ConfidenceIndicator';
import { ConsultationStatusBadge } from '@/components/consultations/ConsultationStatusBadge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getVerificationQueue } from '@/lib/api/workflow';
import type { ClinicalNote, Consultation } from '@/lib/types';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileSearch,
  ShieldCheck,
  User,
} from 'lucide-react';

function getLatestNote(consultation: Consultation) {
  return consultation.clinical_note as ClinicalNote | undefined;
}

type FilterTab = 'all' | 'critical' | 'warnings' | 'ready';

export default function VerifyPage() {
  const clinicId = useAuthStore((state) => state.profile?.clinic_id);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');

  useEffect(() => {
    async function load() {
      if (!clinicId) return;
      setLoading(true);
      try {
        setConsultations(await getVerificationQueue(clinicId));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [clinicId]);

  // Compute stats
  const stats = consultations.reduce(
    (acc, c) => {
      const note = getLatestNote(c);
      const criticals = note?.qa_findings?.filter((f) => f.severity === 'critical').length || 0;
      const warnings = note?.qa_findings?.filter((f) => f.severity === 'warning').length || 0;
      if (criticals > 0) acc.critical++;
      else if (warnings > 0) acc.warnings++;
      else acc.ready++;
      acc.total++;
      return acc;
    },
    { total: 0, critical: 0, warnings: 0, ready: 0 }
  );

  // Filter consultations
  const filtered = consultations.filter((c) => {
    if (filter === 'all') return true;
    const note = getLatestNote(c);
    const criticals = note?.qa_findings?.filter((f) => f.severity === 'critical').length || 0;
    const warnings = note?.qa_findings?.filter((f) => f.severity === 'warning').length || 0;
    if (filter === 'critical') return criticals > 0;
    if (filter === 'warnings') return warnings > 0 && criticals === 0;
    if (filter === 'ready') return criticals === 0 && warnings === 0;
    return true;
  });

  const filterTabs: { id: FilterTab; label: string; count: number; color: string }[] = [
    { id: 'all', label: 'All', count: stats.total, color: 'text-on-surface' },
    { id: 'critical', label: 'Critical', count: stats.critical, color: 'text-error' },
    { id: 'warnings', label: 'Warnings', count: stats.warnings, color: 'text-warning' },
    { id: 'ready', label: 'Ready', count: stats.ready, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow"
        title="Verify"
        description="Review notes, inspect provenance, resolve safety flags, and sign off with confidence."
        variant="feature"
      />

      {/* Stats strip */}
      {!loading && consultations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl bg-surface-container-low px-4 py-3"
          >
            <p className="text-xs text-on-surface-variant font-medium">Total Queue</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-xl bg-error/5 px-4 py-3"
          >
            <p className="text-xs text-error font-medium">Critical</p>
            <p className="text-2xl font-bold text-error mt-1">{stats.critical}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl bg-warning/5 px-4 py-3"
          >
            <p className="text-xs text-warning font-medium">Warnings</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.warnings}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-xl bg-success/5 px-4 py-3"
          >
            <p className="text-xs text-success font-medium">Ready to Approve</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.ready}</p>
          </motion.div>
        </div>
      )}

      {/* Filter tabs */}
      {!loading && consultations.length > 0 && (
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs font-bold ${filter === tab.id ? 'text-secondary' : tab.color}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
            >
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton variant="rectangular" className="h-5 w-20 rounded-full" />
                  <Skeleton variant="rectangular" className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton variant="rectangular" className="h-8 w-20 rounded-lg" />
                    <Skeleton variant="rectangular" className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Nothing waiting for verification"
          description="Notes move here after transcription and AI generation. Start a new consultation to begin."
        />
      ) : filtered.length === 0 ? (
        <Card className="text-center py-10">
          <CheckCircle2 className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">
            No notes match this filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((consultation, index) => {
            const note = getLatestNote(consultation);
            const patientName = consultation.patient
              ? `${consultation.patient.first_name} ${consultation.patient.last_name}`
              : 'Unknown patient';
            const criticalCount = note?.qa_findings?.filter((f) => f.severity === 'critical').length || 0;
            const warningCount = note?.qa_findings?.filter((f) => f.severity === 'warning').length || 0;
            const infoCount = note?.qa_findings?.filter((f) => f.severity === 'info').length || 0;
            const discrepancyCount =
              note?.qa_findings?.filter((f) => f.code.startsWith('chart_discrepancy_')).length || 0;
            const unsupportedCount =
              note?.provenance_map?.filter((item) => item.source === 'needs_review').length || 0;
            const overall = note?.confidence_scores?.overall || 0;
            const isApproved = note?.is_approved;
            const timeAgo = getTimeAgo(consultation.updated_at);

            // Determine card accent
            const accent = criticalCount > 0
              ? 'border-l-4 border-l-error'
              : warningCount > 0
                ? 'border-l-4 border-l-warning'
                : isApproved
                  ? 'border-l-4 border-l-success'
                  : '';

            return (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link href={`/consultations/${consultation.id}/review`}>
                  <Card className={`hover:shadow-ambient transition-all group ${accent}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Left: Patient info + badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <ConsultationStatusBadge status={consultation.status} />
                          {criticalCount > 0 && (
                            <Badge variant="error">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {criticalCount} critical
                            </Badge>
                          )}
                          {warningCount > 0 && (
                            <Badge variant="warning">{warningCount} warnings</Badge>
                          )}
                          {discrepancyCount > 0 && (
                            <Badge variant="warning">{discrepancyCount} conflicts</Badge>
                          )}
                          {unsupportedCount > 0 && (
                            <Badge variant="default">{unsupportedCount} unverified</Badge>
                          )}
                          {isApproved && (
                            <Badge variant="success">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Approved
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-on-surface truncate">
                              {patientName}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                              <span>{consultation.consultation_type}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Confidence + QA summary + action */}
                      <div className="flex items-center gap-4 shrink-0">
                        {/* QA summary pills */}
                        {note && (criticalCount + warningCount + infoCount) > 0 && (
                          <div className="hidden sm:flex items-center gap-1.5">
                            {criticalCount > 0 && (
                              <span className="w-6 h-6 rounded-full bg-error/10 text-error text-xs font-bold flex items-center justify-center">
                                {criticalCount}
                              </span>
                            )}
                            {warningCount > 0 && (
                              <span className="w-6 h-6 rounded-full bg-warning/10 text-warning text-xs font-bold flex items-center justify-center">
                                {warningCount}
                              </span>
                            )}
                            {infoCount > 0 && (
                              <span className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold flex items-center justify-center">
                                {infoCount}
                              </span>
                            )}
                          </div>
                        )}

                        {note && <ConfidenceIndicator score={overall} />}

                        <div className="flex items-center gap-1.5 text-sm font-medium text-secondary group-hover:text-primary transition-colors">
                          Review
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
