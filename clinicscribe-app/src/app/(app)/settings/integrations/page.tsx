import Link from 'next/link';
import { ArrowRight, Calendar, Database, FileSignature, Mail, Plug } from 'lucide-react';
import { Card } from '@/components/ui/Card';

/**
 * Integrations entry under Settings. Connection management itself lives at
 * `/integrations` (linked from the main sidebar) — this page summarises
 * status + routes clinicians to the full page when they want to wire
 * something up.
 */

const INTEGRATIONS = [
  {
    name: 'Best Practice',
    sub: 'EMR sync — push approved notes back to the patient file.',
    icon: Database,
    status: 'connect' as const,
  },
  {
    name: 'Medical Director',
    sub: 'EMR sync — patient context + approved-note push.',
    icon: Database,
    status: 'connect' as const,
  },
  {
    name: 'Genie',
    sub: 'EMR sync — Australian general practice management.',
    icon: Database,
    status: 'connect' as const,
  },
  {
    name: 'Google Calendar',
    sub: 'Show today\'s consultations on the dashboard.',
    icon: Calendar,
    status: 'connect' as const,
  },
  {
    name: 'eRx',
    sub: 'Prescription handoff (coming soon).',
    icon: FileSignature,
    status: 'soon' as const,
  },
  {
    name: 'Email exports',
    sub: 'Send patient summaries by email after approval.',
    icon: Mail,
    status: 'available' as const,
  },
];

export default function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-secondary/30 bg-secondary/6 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-secondary">
          <Plug className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold">Manage connections</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-on-surface-variant">
            Click any service to authorise it. You can pause or disconnect at any time without
            losing existing data — already-pushed notes stay on the patient file.
          </p>
        </div>
        <Link
          href="/integrations"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-on-surface px-3.5 text-[12px] font-bold text-surface hover:bg-on-surface/90"
        >
          Open full hub
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        {INTEGRATIONS.map((it, idx) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.name}
              href="/integrations"
              className={
                'flex items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-container/40' +
                (idx < INTEGRATIONS.length - 1 ? ' border-b border-outline-variant/40' : '')
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-secondary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold">{it.name}</p>
                <p className="mt-0.5 text-[12px] text-on-surface-variant">{it.sub}</p>
              </div>
              <StatusChip status={it.status} />
            </Link>
          );
        })}
      </Card>
    </div>
  );
}

function StatusChip({ status }: { status: 'connect' | 'available' | 'soon' }) {
  if (status === 'available') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Ready
      </span>
    );
  }
  if (status === 'soon') {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
        Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">
      Connect
      <ArrowRight className="h-3 w-3" />
    </span>
  );
}
