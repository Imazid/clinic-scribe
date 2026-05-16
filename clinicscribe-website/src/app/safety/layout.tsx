import type { Metadata } from "next";

const title = "Safety & compliance — Verification stays with the clinician";
const description =
  "How Miraa keeps clinicians in control: mandatory review gates, audit logs, provenance labelling, FHIR R4 interoperability, end-to-end encryption, and Australian Privacy Principles by design.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/safety" },
  openGraph: {
    title,
    description,
    url: "/safety",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function SafetyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
