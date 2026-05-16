import type { Metadata } from "next";

const title = "Pricing — Simple plans, built to scale";
const description =
  "Solo, clinic, group practice, and enterprise plans for Miraa — the clinical workflow copilot. Per-clinician monthly pricing with a 14-day free trial when we launch.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title,
    description,
    url: "/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
