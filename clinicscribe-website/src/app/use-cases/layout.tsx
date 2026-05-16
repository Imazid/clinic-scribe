import type { Metadata } from "next";

const title = "Use cases — Built for GP and specialty workflows";
const description =
  "How Miraa fits the day-to-day of general practice and specialist clinics: long consults, complex medication histories, multi-issue visits, telehealth, and follow-up workflows.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/use-cases" },
  openGraph: {
    title,
    description,
    url: "/use-cases",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function UseCasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
