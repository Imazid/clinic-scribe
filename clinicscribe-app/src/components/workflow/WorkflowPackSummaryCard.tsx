'use client';

import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle } from '@/components/ui/Card';
import type { WorkflowPack } from '@/lib/types';
import { Layers3 } from 'lucide-react';

interface WorkflowPackSummaryCardProps {
  pack: WorkflowPack;
  title: string;
  description: string;
  primaryItems: string[];
  secondaryTitle?: string;
  secondaryItems?: string[];
}

function ItemList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkflowPackSummaryCard({
  pack,
  title,
  description,
  primaryItems,
  secondaryTitle,
  secondaryItems = [],
}: WorkflowPackSummaryCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Layers3 className="w-4 h-4 text-secondary" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">{pack.title}</Badge>
          <Badge>{pack.specialty}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ItemList title="Primary Focus" items={primaryItems} />
        {secondaryTitle ? <ItemList title={secondaryTitle} items={secondaryItems} /> : null}
      </div>
    </Card>
  );
}
