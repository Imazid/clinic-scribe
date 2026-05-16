import type { Metadata } from "next";
import Script from "next/script";
import { FAQS } from "@/lib/constants";

const title = "FAQ — Common questions about Miraa";
const description =
  "Answers to the most common questions about Miraa: pricing and pilot, safety and review gates, integrations and data handling, and how the workflow fits a clinical day.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title,
    description,
    url: "/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// Safe JSON-LD: serialize, then defensively escape any "</" so the JSON literal
// cannot break out of the inline <script> element. Content is built from a
// controlled FAQS constant — no user input, no XSS surface.
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}).replace(/</g, "\\u003c");

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {faqJsonLd}
      </Script>
      {children}
    </>
  );
}
