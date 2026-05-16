import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import type { Patient } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RecentPatientsTileProps {
  patients: Patient[];
}

function ageFromDob(dob: string): number | null {
  if (!dob) return null;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age -= 1;
  return age >= 0 && age < 150 ? age : null;
}

function lastSeen(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

/** Compact list of recently-seen patients — pairs with TodayRail in the
 *  dashboard's right-hand column. */
export function RecentPatientsTile({ patients }: RecentPatientsTileProps) {
  return (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="eyebrow mb-1">Recent</div>
          <div className="text-[16px] font-bold text-on-surface">Recent patients</div>
        </div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          All patients <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divider-h" />
      {patients.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-on-surface-variant">
          No recent patient activity yet.
        </div>
      ) : (
        <div>
          {patients.slice(0, 5).map((p, i) => {
            const age = ageFromDob(p.date_of_birth);
            const meta = [
              age != null ? `${age}` : null,
              p.sex.charAt(0).toUpperCase(),
              p.mrn ? `MRN-${p.mrn}` : null,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <Link
                key={p.id}
                href={`/patients/${p.id}`}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-container-low',
                  i < Math.min(patients.length, 5) - 1 && 'border-b border-outline-variant/60',
                )}
              >
                <Avatar firstName={p.first_name} lastName={p.last_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-on-surface">
                    {p.first_name} {p.last_name}
                  </div>
                  <div className="text-[11px] text-outline">{meta}</div>
                </div>
                <div className="text-[11px] text-outline">{lastSeen(p.last_appointment_at)}</div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
