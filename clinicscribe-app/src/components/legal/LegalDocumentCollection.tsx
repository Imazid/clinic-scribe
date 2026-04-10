import Link from 'next/link';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import type { LegalDocument } from '@/lib/legal';

interface LegalDocumentCollectionProps {
  documents: LegalDocument[];
  showDirectory?: boolean;
  basePath?: string;
}

function documentPath(basePath: string, slug: LegalDocument['slug']) {
  if (slug === 'privacy') return '/privacy';
  if (slug === 'terms') return '/terms';
  return `${basePath}#${slug}`;
}

export function LegalDocumentCollection({
  documents,
  showDirectory = true,
  basePath = '/legal',
}: LegalDocumentCollectionProps) {
  return (
    <div className="space-y-6">
      {showDirectory ? (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-outline-variant/40 px-6 py-5">
            <CardTitle className="text-base">Document directory</CardTitle>
            <CardDescription>
              Privacy, service terms, data processing, and the clinician review disclaimer in one place.
            </CardDescription>
          </div>
          <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
            {documents.map((document) => (
              <Link
                key={document.slug}
                href={documentPath(basePath, document.slug)}
                className="rounded-[1.35rem] border border-outline-variant/40 bg-surface-container-low px-5 py-5 transition-colors hover:border-secondary/40 hover:bg-secondary/5"
              >
                <p className="text-sm font-semibold text-on-surface">{document.title}</p>
                <p className="mt-2 text-sm text-on-surface-variant">{document.description}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-secondary">
                  Last updated {document.lastUpdated}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      {documents.map((document) => (
        <Card key={document.slug} id={document.slug} className="overflow-hidden p-0 scroll-mt-24">
          <div className="border-b border-outline-variant/40 px-6 py-5">
            <p className="label-text mb-2 text-secondary">{document.lastUpdated}</p>
            <CardTitle>{document.title}</CardTitle>
            <CardDescription>{document.description}</CardDescription>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-2">
              {document.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface"
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="space-y-5">
              {document.sections.map((section) => (
                <section key={section.heading} className="space-y-2">
                  <h2 className="text-base font-semibold text-on-surface">{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-6 text-on-surface-variant">
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
