import Link from 'next/link';
import { ArrowRight, Calendar, Database, FileSignature, Mail, Plug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type IntegrationStatus = 'connected' | 'available' | 'soon';

interface IntegrationItem {
  name: string;
  sub: string;
  icon: LucideIcon;
  status: IntegrationStatus;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    name: 'Best Practice',
    sub: 'EMR sync — push approved notes back to the patient file.',
    icon: Database,
    status: 'available',
  },
  {
    name: 'Medical Director',
    sub: 'EMR sync — patient context + approved-note push.',
    icon: Database,
    status: 'available',
  },
  {
    name: 'Genie',
    sub: 'EMR sync — Australian general practice management.',
    icon: Database,
    status: 'available',
  },
  {
    name: 'Google Calendar',
    sub: "Show today's consultations on the dashboard.",
    icon: Calendar,
    status: 'available',
  },
  {
    name: 'Outlook Calendar',
    sub: 'Two-way sync with Microsoft 365 schedules.',
    icon: Calendar,
    status: 'available',
  },
  {
    name: 'eRx',
    sub: 'Prescription handoff to AU pharmacies.',
    icon: FileSignature,
    status: 'soon',
  },
  {
    name: 'Email exports',
    sub: 'Send patient summaries by email after approval.',
    icon: Mail,
    status: 'connected',
  },
];

export default function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-secondary/30 bg-secondary-fixed/60 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-secondary">
          <Plug className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-on-surface">Manage connections</p>
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

      <div className="grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.name}
              href="/integrations"
              className="group flex items-start gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-ambient-sm transition-colors hover:border-secondary/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-secondary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-bold text-on-surface">{it.name}</p>
                  <StatusChip status={it.status} />
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-on-surface-variant">{it.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: IntegrationStatus }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Connected
      </span>
    );
  }
  if (status === 'soon') {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
      Connect
      <ArrowRight className="h-3 w-3" />
    </span>
  );
}
