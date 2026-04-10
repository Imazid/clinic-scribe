import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BRAND } from "@/lib/constants";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${plusJakarta.variable} font-sans antialiased bg-surface text-on-surface`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
