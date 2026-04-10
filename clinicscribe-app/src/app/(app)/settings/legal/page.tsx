import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { LegalDocumentCollection } from '@/components/legal/LegalDocumentCollection';
import { Button } from '@/components/ui/Button';
import { LEGAL_DOCUMENTS } from '@/lib/legal';

export default function SettingsLegalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Legal"
        title="Legal & Privacy"
        description="Review the privacy, service, data processing, and AI safety documents that govern Miraa usage."
        actions={
          <Link href="/legal">
            <Button variant="outline">Open public legal hub</Button>
          </Link>
        }
      />

      <LegalDocumentCollection documents={LEGAL_DOCUMENTS} />
    </div>
  );
}
