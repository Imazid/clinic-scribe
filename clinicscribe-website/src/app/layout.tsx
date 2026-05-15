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

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: `${BRAND.name} — ${BRAND.expandedName}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    "clinical documentation",
    "clinical workflow copilot",
    "medical transcription",
    "SOAP notes",
    "healthcare AI",
    "consultation capture",
    "clinical notes",
    "Australia",
    "GP software",
    "medical workflow",
  ],
  authors: [{ name: BRAND.name }],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.expandedName}`,
    description: BRAND.description,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  url: BRAND.url,
  description: BRAND.description,
  foundingDate: BRAND.founded,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sydney",
    addressCountry: "AU",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  applicationCategory: "MedicalApplication",
  description: BRAND.description,
  url: BRAND.url,
  operatingSystem: "Web, iOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AUD",
    description: "Free pilot access — contact for pricing",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
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
