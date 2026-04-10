import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { LegalDocumentCollection } from '@/components/legal/LegalDocumentCollection';
import { Button } from '@/components/ui/Button';
import { LEGAL_DOCUMENTS } from '@/lib/legal';

export default function LegalPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        title="Privacy, terms, and clinical AI safeguards"
        description="Everything that governs how Miraa handles data, service access, and clinician-reviewed AI workflow output."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/privacy">
              <Button variant="outline">Privacy policy</Button>
            </Link>
            <Link href="/terms">
              <Button>Terms of service</Button>
            </Link>
          </div>
        }
        variant="feature"
      />

      <LegalDocumentCollection documents={LEGAL_DOCUMENTS} />
    </main>
  );
}
