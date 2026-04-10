'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plug, CheckCircle, Clock, Zap } from 'lucide-react';

const integrations = [
  { name: 'Best Practice', description: 'Direct integration with Australia\'s most popular GP software', status: 'pilot' as const, category: 'Clinical Software' },
  { name: 'MedicalDirector', description: 'Seamless note export and patient record sync', status: 'pilot' as const, category: 'Clinical Software' },
  { name: 'Genie Solutions', description: 'Integration for specialist practice management', status: 'planned' as const, category: 'Clinical Software' },
  { name: 'Telehealth Platforms', description: 'Audio capture from telehealth sessions', status: 'pilot' as const, category: 'Telehealth' },
  { name: 'FHIR R4', description: 'Standards-based interoperability for EHR/EMR systems', status: 'planned' as const, category: 'Standards' },
  { name: 'HL7 v2', description: 'Legacy health system messaging support', status: 'planned' as const, category: 'Standards' },
  { name: 'eRx Script Exchange', description: 'Prescription draft pre-population', status: 'planned' as const, category: 'Prescribing' },
  { name: 'Medicare Online', description: 'MBS item billing code suggestions', status: 'planned' as const, category: 'Billing' },
];

const statusConfig = {
  connected: { label: 'Connected', variant: 'success' as const, icon: CheckCircle },
  pilot: { label: 'Pilot', variant: 'info' as const, icon: Zap },
  planned: { label: 'Planned', variant: 'default' as const, icon: Clock },
};

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader title="EHR Integration Hub" description="Connect Miraa with your existing clinical systems." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const config = statusConfig[integration.status];
          const Icon = config.icon;
          return (
            <Card key={integration.name} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center">
                  <Plug className="w-5 h-5 text-secondary" />
                </div>
                <Badge variant={config.variant}>
                  <Icon className="w-3 h-3 mr-1" /> {config.label}
                </Badge>
              </div>
              <h3 className="text-sm font-semibold text-on-surface mb-1">{integration.name}</h3>
              <p className="text-xs text-on-surface-variant flex-1 mb-4">{integration.description}</p>
              <p className="label-text text-outline mb-3">{integration.category}</p>
              <Button variant="outline" size="sm" className="w-full" disabled={integration.status === 'planned'}>
                {integration.status === 'planned' ? 'Coming Soon' : 'Configure'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
