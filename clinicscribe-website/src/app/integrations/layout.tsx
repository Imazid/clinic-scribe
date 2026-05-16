import type { Metadata } from "next";

const title = "Integrations — Connect with the systems your clinic already uses";
const description =
  "Miraa exports approved documentation to your existing clinical software. FHIR R4 native, Genie Solutions integration in pilot, and a roadmap of clinical software, telehealth, and billing integrations.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/integrations" },
  openGraph: {
    title,
    description,
    url: "/integrations",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
