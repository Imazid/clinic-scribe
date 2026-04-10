'use client';

import { CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { TimelineEvent } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Activity, ClipboardCheck, FileText } from 'lucide-react';

const eventIcons = {
  consultation: Activity,
  task: ClipboardCheck,
  document: FileText,
} as const;

export function PatientStoryFeed({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-on-surface-variant">
        No longitudinal story items yet.
      </div>
    );
  }

  return (
    <div>
      <CardTitle className="mb-4">Longitudinal Story</CardTitle>
      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = eventIcons[event.event_type as keyof typeof eventIcons] || Activity;
          return (
            <div key={event.id} className="relative flex gap-4">
              {index < events.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-outline-variant/50" />
              )}
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0 z-10">
                <Icon className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div className="flex-1 rounded-xl bg-surface-container-low px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold text-on-surface">{event.title}</p>
                  <Badge variant="default">{event.event_type}</Badge>
                </div>
                <p className="text-sm text-on-surface-variant">{event.summary}</p>
                <p className="text-xs text-outline mt-2">{formatDateTime(event.event_date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
