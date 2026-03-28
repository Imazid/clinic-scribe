'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import type { AuditLog } from '@/lib/types';
import { ClipboardList, Download, User, FileText, Shield } from 'lucide-react';

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  note_approved: Shield,
  patient_created: User,
  note_generated: FileText,
};

export default function AuditPage() {
  const clinicId = useAuthStore((s) => s.profile?.clinic_id);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      if (!clinicId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from('audit_logs')
        .select('*, user:profiles(*)')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100);

      setLogs((data || []) as AuditLog[]);
      setLoading(false);
    }
    load();
  }, [clinicId]);

  const filtered = search
    ? logs.filter((l) => l.action.toLowerCase().includes(search.toLowerCase()) || l.entity_type.toLowerCase().includes(search.toLowerCase()))
    : logs;

  function handleExportCSV() {
    const headers = 'Timestamp,User,Action,Entity Type,Entity ID\n';
    const rows = filtered.map((l) => {
      const userName = l.user ? `${l.user.first_name} ${l.user.last_name}` : l.user_id;
      return `${l.created_at},${userName},${l.action},${l.entity_type},${l.entity_id}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Complete traceability of all actions and AI-generated outputs."
        actions={
          <Button variant="outline" onClick={handleExportCSV} disabled={filtered.length === 0}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      <SearchInput placeholder="Filter by action or entity..." value={search} onSearch={setSearch} onChange={(e) => setSearch(e.target.value)} className="mb-6 max-w-md" />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="rectangular" className="h-16 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No audit logs" description="Actions will be logged here automatically." />
      ) : (
        <Card>
          <div className="divide-y divide-outline-variant/30">
            {filtered.map((log) => {
              const Icon = actionIcons[log.action] || ClipboardList;
              return (
                <div key={log.id} className="flex items-center gap-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-on-surface-variant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface">
                      <span className="font-medium">{log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'}</span>
                      {' '}{log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {log.entity_type} &middot; {formatDateTime(log.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
