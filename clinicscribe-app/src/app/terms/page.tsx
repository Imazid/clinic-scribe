import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { LegalDocumentCollection } from '@/components/legal/LegalDocumentCollection';
import { Button } from '@/components/ui/Button';
import { getLegalDocument } from '@/lib/legal';

export default function TermsPage() {
  const terms = getLegalDocument('terms');

  if (!terms) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        title={terms.title}
        description={terms.description}
        actions={
          <Link href="/legal">
            <Button variant="outline">Back to legal hub</Button>
          </Link>
        }
        variant="feature"
      />

      <LegalDocumentCollection documents={[terms]} showDirectory={false} basePath="/terms" />
    </main>
  );
}
