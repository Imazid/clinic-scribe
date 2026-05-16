import type { Metadata } from "next";

const title = "Product — From the room to the record";
const description =
  "Six steps that take a consult from the briefing before it starts to the follow-up after it ends — written by AI, signed off by you. See how Miraa captures, drafts, verifies, and exports clinical notes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/product" },
  openGraph: {
    title,
    description,
    url: "/product",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
