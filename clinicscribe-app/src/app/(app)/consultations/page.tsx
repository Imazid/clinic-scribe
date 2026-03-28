'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConsultationCard } from '@/components/consultations/ConsultationCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchInput } from '@/components/ui/SearchInput';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getConsultations } from '@/lib/api/consultations';
import type { Consultation } from '@/lib/types';
import { Plus, Stethoscope } from 'lucide-react';

const statusFilters = ['all', 'recording', 'transcribing', 'generating', 'review_pending', 'approved', 'exported'];

export default function ConsultationsPage() {
  const router = useRouter();
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      if (!clinicId) return;
      setLoading(true);
      try {
        const data = await getConsultations(clinicId, statusFilter);
        setConsultations(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [clinicId, statusFilter]);

  const filtered = search
    ? consultations.filter((c) => {
        const name = c.patient ? `${c.patient.first_name} ${c.patient.last_name}` : '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : consultations;

  return (
    <div>
      <PageHeader
        title="Consultations"
        description="Record, transcribe, and review clinical notes."
        actions={
          <Button onClick={() => router.push('/consultations/new')}>
            <Plus className="w-4 h-4" /> New Consultation
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput placeholder="Search by patient name..." value={search} onSearch={setSearch} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 overflow-x-auto no-scrollbar">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === s ? 'bg-surface-container-lowest text-on-surface shadow-ambient-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rectangular" className="h-20 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No consultations" description="Start a new consultation to begin." actionLabel="New Consultation" onAction={() => router.push('/consultations/new')} />
      ) : (
        <div className="space-y-3">{filtered.map((c) => <ConsultationCard key={c.id} consultation={c} />)}</div>
      )}
    </div>
  );
}
