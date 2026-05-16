import type { Metadata } from "next";

const title = "Genie Solutions integration — FHIR-native clinical notes";
const description =
  "Connect Miraa with Magentus Genie — Australia's leading specialist practice management software. Pull patient context, draft AI-assisted documentation, and push approved notes back through FHIR R4 APIs.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/integrations/genie" },
  openGraph: {
    title,
    description,
    url: "/integrations/genie",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function GenieLayout({ children }: { children: React.ReactNode }) {
  return children;
}
