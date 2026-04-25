"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  ChevronDown,
  Building2,
  Stethoscope,
  Users,
  Landmark,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { PRICING_TIERS, PRICING_DISCLAIMER } from "@/lib/constants";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextReveal } from "@/components/ui/TextReveal";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55 },
};

const tierIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Solo: Stethoscope,
  Clinic: Building2,
  "Group Practice": Users,
  Enterprise: Landmark,
};

const pricingFaqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan will include a 14-day free trial once Miraa launches. We are not taking live sign-ups yet, so the current pricing page is a preview only.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Once Miraa is live, you will be able to move between plans as your practice changes. We will share the exact billing rules closer to launch.",
  },
  {
    question: "What counts as a clinician seat?",
    answer:
      "A clinician seat is for any healthcare professional who uses the ambient transcription and note generation features. Practice managers and administrative staff who only access the admin dashboard do not require a clinician seat.",
  },
  {
    question: "Do you offer discounts for larger practices?",
    answer:
      "Yes. Group and enterprise pricing will be finalised before launch. Join the waitlist if you want to hear when larger-practice pricing is confirmed.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="section-atmosphere overflow-hidden bg-surface-container-low pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="label-text text-secondary"
          >
            Pricing
          </motion.p>
          <TextReveal
            as="h1"
            className="mt-4 text-4xl md:text-6xl font-bold text-primary tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
            stagger={0.05}
            segments={[
              { text: "Simple plans," },
              { text: " built to scale", className: "accent-serif" },
            ]}
          />
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
            style={{ textWrap: "pretty" }}
          >
            From a solo clinician to a multi-site group, every tier includes a 14-day free trial when Miraa launches.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest/80 px-4 py-1.5 text-xs text-on-surface-variant"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Preview pricing · not live yet</span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-surface py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
            {PRICING_TIERS.map((tier, i) => {
              const Icon = tierIcons[tier.name] ?? Stethoscope;
              const isHighlighted = tier.highlighted;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className={`relative flex flex-col rounded-3xl p-7 transition-shadow ${
                    isHighlighted
                      ? "bg-surface-container-lowest shadow-ambient ring-1 ring-secondary/40 hover:shadow-ambient-lg"
                      : "bg-surface-container-lowest/95 border border-outline-variant/25 shadow-ambient-sm hover:shadow-ambient"
                  }`}
                >
                  {/* Header: icon + highlight chip */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        isHighlighted
                          ? "bg-secondary text-on-secondary"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isHighlighted && (
                      <span className="text-[10px] tracking-[0.14em] uppercase font-bold text-secondary bg-secondary-fixed rounded-full px-2.5 py-1">
                        Most popular
                      </span>
                    )}
                  </div>

                  {/* Name + description */}
                  <h3 className="text-xl font-bold text-primary">
                    {tier.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-on-surface-variant leading-relaxed min-h-[2.5rem]">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 pb-6 border-b border-outline-variant/40">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="text-5xl font-display font-semibold text-primary tracking-tight"
                        style={{ letterSpacing: "-0.03em" }}
                      >
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-sm text-on-surface-variant">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-outline">
                      Billed monthly · 14-day free trial
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {tier.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-secondary" strokeWidth={3} />
                        </span>
                        <span className="text-sm text-on-surface-variant leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8">
                    <div
                      aria-disabled="true"
                      className={`flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold rounded-full cursor-not-allowed ${
                        isHighlighted
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 text-center text-xs text-outline max-w-2xl mx-auto leading-relaxed"
          >
            {PRICING_DISCLAIMER}
          </motion.p>
        </div>
      </section>

      {/* Enterprise Note */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden flex flex-col items-start gap-6 rounded-3xl p-8 md:p-10 md:flex-row md:items-center"
            style={{
              background:
                "linear-gradient(160deg, #1F1A14 0%, #3B2E22 100%)",
            }}
          >
            {/* Ambient glow */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(47,90,122,0.45) 0%, transparent 70%)",
              }}
            />

            <div className="relative w-14 h-14 rounded-2xl bg-[rgba(252,249,244,0.08)] border border-[rgba(252,249,244,0.12)] flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 text-secondary-fixed-dim" />
            </div>

            <div className="relative flex-1 text-on-primary">
              <p className="label-text text-secondary-fixed-dim">
                Enterprise &amp; multi-site
              </p>
              <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
                Deploying across a network?
              </h3>
              <p className="mt-3 text-sm md:text-base text-[rgba(252,249,244,0.7)] leading-relaxed max-w-xl">
                Custom integrations, on-premise options, dedicated onboarding, and SLAs. We&apos;re finalising enterprise terms before launch — tell us what you need.
              </p>
            </div>

            <div className="relative shrink-0 w-full md:w-auto">
              <MagneticButton className="w-full md:w-auto">
                <Link
                  href="/waitlist"
                  className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-6 py-3 text-sm font-semibold text-primary transition-shadow hover:shadow-ambient"
                >
                  Get in touch
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary">Common questions</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-primary tracking-tight">
              Pricing
              <span className="accent-serif"> FAQ</span>
            </h2>
          </motion.div>

          <div className="space-y-2.5">
            {pricingFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-surface-container-low/50"
                >
                  <span className="text-[15px] font-semibold text-primary pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-outline shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="px-5 pb-5">
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
              Want first access
              <span className="accent-serif"> when Miraa launches?</span>
            </h2>
            <p className="mt-5 text-on-surface-variant text-lg leading-relaxed">
              Join the waitlist. We&apos;ll email you when the 14-day free trial opens and sign-up goes live.
            </p>
            <div className="mt-8 flex justify-center">
              <MagneticButton>
                <Link
                  href="/waitlist"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-[15px] hover:-translate-y-px hover:shadow-ambient-sm transition-all"
                >
                  Join the waitlist
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
