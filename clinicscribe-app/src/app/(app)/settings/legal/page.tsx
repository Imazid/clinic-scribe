import Link from 'next/link';
import { LegalDocumentCollection } from '@/components/legal/LegalDocumentCollection';
import { Button } from '@/components/ui/Button';
import { LEGAL_DOCUMENTS } from '@/lib/legal';

export default function SettingsLegalPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/legal">
          <Button variant="outline">Open public legal hub</Button>
        </Link>
      </div>
      <LegalDocumentCollection documents={LEGAL_DOCUMENTS} />
    </div>
  );
}
