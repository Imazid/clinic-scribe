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
    name: "Dr. Alex Chen",
    role: "Co-Founder & Medical Director",
    bio: "Former GP with 12 years of clinical experience. Understands documentation burden firsthand. Ensures clinical relevance in every feature.",
  },
  {
    name: "Sarah Mitchell",
    role: "Co-Founder & CEO",
    bio: "Background in health technology and regulatory compliance. Focused on building responsible AI products for the Australian healthcare market.",
  },
  {
    name: "James Park",
    role: "CTO",
    bio: "AI and NLP engineer with experience in speech recognition and clinical language processing. Leads the technical architecture and safety framework.",
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

          <motion.p
            {...fadeUp}
            className="text-center text-xs text-outline mt-8"
          >
            Team profiles shown are representative placeholders. Updated team
            details coming soon.
          </motion.p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Want to Learn More?
            </h2>
            <p className="text-on-surface-variant mb-8">
              Join the waitlist to hear when Miraa launches, or reach out to our
              team directly if you want to talk through your practice needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#waitlist-form"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant/25 bg-surface-container-lowest px-8 py-3.5 text-sm font-semibold text-primary shadow-ambient-sm transition-colors hover:bg-surface-container"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
