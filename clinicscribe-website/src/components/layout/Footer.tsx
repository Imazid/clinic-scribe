import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/constants";

const footerLinks = {
  Product: [
    { label: "Features", href: "/product" },
    { label: "Security", href: "/safety" },
    { label: "Integrations", href: "/integrations" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/about#contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Data handling", href: "/safety" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/monogram.svg"
                alt="Miraa"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-base font-bold text-primary tracking-tight">{BRAND.shortName}</span>
            </Link>
            <p className="text-[13.5px] text-on-surface-variant leading-relaxed max-w-sm mb-6">
              Clinical AI that writes the note, not the story. Built in Australia, for clinicians.
            </p>
            <p className="text-xs text-outline">
              {BRAND.location}
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="label-text text-outline mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-primary opacity-75 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(216, 207, 190, 0.7)" }}>
          <p className="text-xs text-outline">
            &copy; {new Date().getFullYear()} Miraa Health. Made with care in Sydney.
          </p>
          <p className="text-xs text-outline text-center">
            AI-generated clinical documentation requires clinician review before finalisation. Not a medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
