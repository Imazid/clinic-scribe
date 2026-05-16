import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { BRAND } from "@/lib/constants";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

const homeTitle = `${BRAND.name} — ${BRAND.tagline}`;
const homeDescription =
  "Miraa listens to your consultation, drafts the note, and lets you verify and export — so clinicians spend more time with patients and less with paperwork. Built in Australia.";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: homeTitle,
    template: `%s | ${BRAND.name}`,
  },
  description: homeDescription,
  applicationName: BRAND.name,
  keywords: [
    "clinical documentation",
    "clinical workflow copilot",
    "ambient clinical scribe",
    "medical transcription",
    "SOAP notes",
    "healthcare AI",
    "consultation capture",
    "clinical notes",
    "Australia",
    "GP software",
    "FHIR",
    "Genie integration",
    "medical workflow",
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: BRAND.name,
    title: homeTitle,
    description: homeDescription,
    url: BRAND.url,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    creator: "@miraahealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  url: BRAND.url,
  description: BRAND.description,
  foundingDate: BRAND.founded,
  email: BRAND.supportEmail,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sydney",
    addressCountry: "AU",
  },
};

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  applicationCategory: "MedicalApplication",
  operatingSystem: "Web, iOS",
  description: homeDescription,
  url: BRAND.url,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AUD",
    description: "Join the waitlist — 14-day free trial at launch",
  },
  publisher: {
    "@type": "Organization",
    name: BRAND.name,
    url: BRAND.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${fraunces.variable} font-sans antialiased bg-surface text-on-surface`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd) }}
        />
        <SmoothScroll />
        <ScrollProgressBar />
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
