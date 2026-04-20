"use client";

import { motion } from "framer-motion";
import {
  UserCheck,
  ShieldCheck,
  Globe,
  Sparkles,
  ArrowRight,
  Heart,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ContactForm } from "@/components/sections/ContactForm";
import { BRAND } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const values = [
  {
    icon: UserCheck,
    title: "Clinician-First",
    description:
      "Every feature is designed from the clinician's perspective. The tool serves the clinician — not the other way around. If it adds friction without adding value, it does not ship.",
  },
  {
    icon: ShieldCheck,
    title: "Safety by Design",
    description:
      "Safety is not a feature we add later. Mandatory review gates, audit trails, and confidence indicators are architectural decisions, not optional settings.",
  },
  {
    icon: Globe,
    title: "Australian-Built",
    description:
      "Built in Australia for Australian healthcare. We understand the regulatory landscape, the clinical software ecosystem, and the workflow expectations of Australian clinicians.",
  },
  {
    icon: Sparkles,
    title: "Honest About AI",
    description:
      "We are clear about what AI can and cannot do. We do not overpromise. Our system drafts documentation — it does not replace clinical judgment. Transparency builds trust.",
  },
];

const team = [
  {
    name: "Ihtisham Mazid",
    role: "Founder & CEO",
    bio: "Ihtisham Mazid is the founder and CEO of Miraa. He has a background in mechatronics engineering and built the company with a close view of healthcare through family working in the medical field.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-atmosphere overflow-hidden bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            About Us
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            About {BRAND.name}
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            Reducing documentation burden. Respecting clinical responsibility.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center">
            <p className="label-text text-secondary mb-3">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-8">
              Help Clinicians Spend More Time with Patients
            </h2>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Clock,
                stat: "2+ hours",
                label: "Average daily documentation time for GPs",
              },
              {
                icon: Heart,
                stat: "Less time",
                label: "With patients due to paperwork burden",
              },
              {
                icon: Users,
                stat: "Growing",
                label: "Clinician burnout from administrative load",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-lift group bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/25 p-6 shadow-ambient-sm text-center transition-shadow hover:shadow-ambient"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {item.stat}
                </p>
                <p className="text-sm text-on-surface-variant">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp}>
            <p className="label-text text-secondary mb-3">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-8">
              Why We Built {BRAND.shortName}
            </h2>
            <div className="space-y-6 text-on-surface-variant leading-relaxed">
              <p>
                Clinical documentation is one of the most time-consuming parts
                of a clinician&apos;s day. GPs routinely spend two or more hours
                after clinic completing notes, writing referrals, and managing
                follow-up actions. For specialists, the documentation burden is
                often even greater — detailed procedure notes, management plans,
                and specialist letters take significant time to produce.
              </p>
              <p>
                This documentation burden contributes directly to clinician
                burnout, reduces time available for patient care, and creates
                pressure to cut corners on record quality. It is a systemic
                problem that affects patient outcomes.
              </p>
              <p>
                We believe AI can meaningfully reduce this burden — but only if
                it is deployed responsibly. That means building systems where the
                clinician remains in control, where every AI output is reviewed
                before it reaches a patient record, and where safety is an
                architectural decision, not an afterthought.
              </p>
              <p>
                <strong className="text-primary">
                  Clinician trust matters more than technology hype.
                </strong>{" "}
                We earn trust by being transparent about what our system does and
                does not do, by prioritising safety over speed, and by building
                features that clinicians actually want — not features that make
                impressive demos.
              </p>
              <p>
                {BRAND.name} was founded by Ihtisham Mazid, a mechatronics
                engineer with close family ties to the medical field. That mix
                of engineering discipline and lived exposure to clinical work
                shaped the company from the start: build practical systems,
                reduce documentation burden, and respect the realities of care.
              </p>
              <p>
                {BRAND.name} is built in Australia, for Australian healthcare.
                We understand the regulatory landscape, the clinical software
                ecosystem, and the expectations of the clinicians we serve.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-3">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-lift group bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/25 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <value.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-3">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              The People Behind {BRAND.shortName}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-lift group bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/25 p-6 shadow-ambient-sm text-center transition-shadow hover:shadow-ambient"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-on-primary">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-secondary mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="section-atmosphere py-20 bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <motion.div {...fadeUp} className="lg:pt-8">
            <p className="label-text mb-3 text-secondary">Contact Us</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Talk to the Miraa team
            </h2>
            <p className="mb-6 text-on-surface-variant">
              Reach out if you want to discuss a pilot, book a demo, explore an
              integration, or pressure-test whether Miraa fits your workflow.
            </p>
            <p className="mb-8 text-sm leading-relaxed text-on-surface-variant">
              Messages go directly to the company inbox, and you can still use{" "}
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {BRAND.supportEmail}
              </a>{" "}
              if you prefer email.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-3.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`mailto:${BRAND.supportEmail}?subject=Miraa%20Enquiry`}
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant/25 bg-surface-container-lowest px-8 py-3.5 text-sm font-semibold text-primary shadow-ambient-sm transition-colors hover:bg-surface-container"
              >
                Email the team
              </a>
            </div>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ContactForm source="about-contact-section" />
          </motion.div>
        </div>
      </section>
    </>
  );
}
