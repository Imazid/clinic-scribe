import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Linkedin, Twitter, Mail } from "lucide-react";
import { BRAND } from "@/lib/constants";

const footerLinks = {
  Product: [
    { label: "How it works", href: "/product" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/integrations" },
    { label: "Use cases", href: "/use-cases" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/about#contact" },
  ],
  Trust: [
    { label: "Safety & compliance", href: "/safety" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

const socialLinks: Array<{
  label: string;
  href: string;
  icon: typeof Linkedin;
  external?: boolean;
}> = [
  {
    label: "Email",
    href: `mailto:${BRAND.supportEmail}`,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/miraahealth",
    icon: Linkedin,
    external: true,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/miraahealth",
    icon: Twitter,
    external: true,
  },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand + newsletter prompt */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/monogram.svg"
                alt="Miraa"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-base font-bold text-primary tracking-tight">
                {BRAND.shortName}
              </span>
            </Link>
            <p className="text-[13.5px] text-on-surface-variant leading-relaxed max-w-sm mb-5">
              Clinical AI that writes the note, not the story. Built in Australia, for clinicians.
            </p>

            {/* Launch-updates CTA in lieu of a real newsletter form */}
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 max-w-sm shadow-ambient-sm">
              <p className="label-text text-secondary mb-1.5">Launch updates</p>
              <p className="text-[13px] text-on-surface-variant leading-relaxed mb-4">
                We&apos;ll email you the moment {BRAND.shortName} opens.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-on-primary transition-all hover:-translate-y-px hover:shadow-ambient-sm"
              >
                Join the waitlist
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target={s.external ? "_blank" : undefined}
                    rel={s.external ? "noopener noreferrer" : undefined}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant transition-all hover:-translate-y-px hover:border-secondary/40 hover:text-secondary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
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
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          style={{ borderTop: "1px solid rgba(216, 207, 190, 0.7)" }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-outline">
            <p>&copy; {new Date().getFullYear()} Miraa Health. {BRAND.location}.</p>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="hover:text-primary transition-colors"
            >
              {BRAND.supportEmail}
            </a>
          </div>
          <p className="text-xs text-outline md:text-right max-w-md">
            AI-generated clinical documentation requires clinician review before finalisation. Not a medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
