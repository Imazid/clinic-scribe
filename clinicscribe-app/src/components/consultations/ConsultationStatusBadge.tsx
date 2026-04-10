import { Badge } from '@/components/ui/Badge';
import { CONSULTATION_STATUS_LABELS } from '@/lib/constants';
import type { ConsultationStatus } from '@/lib/types';

const statusVariant: Record<ConsultationStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  scheduled: 'info',
  brief_ready: 'info',
  recording: 'error',
  transcribing: 'warning',
  generating: 'info',
  review_pending: 'warning',
  approved: 'success',
  closeout_pending: 'info',
  closed: 'success',
  exported: 'default',
};

export function ConsultationStatusBadge({ status }: { status: ConsultationStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {CONSULTATION_STATUS_LABELS[status]}
    </Badge>
  );
}
