"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ChevronDown, Building2 } from "lucide-react";
import Link from "next/link";
import { PRICING_TIERS, PRICING_DISCLAIMER } from "@/lib/constants";

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
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Pricing
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            Pricing Preview
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            Miraa is not available to buy yet. These plans are an early preview,
            and every tier will include a 14-day free trial when launch sign-up
            opens.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`card-lift group relative flex flex-col rounded-2xl border border-outline-variant/25 p-6 ${
                  tier.highlighted
                    ? "bg-gradient-to-b from-primary to-primary-container text-on-primary shadow-ambient-lg ring-2 ring-secondary-container"
                    : "bg-surface-container-lowest/95 shadow-ambient-sm"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-secondary-container text-primary rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-lg font-bold mb-1 ${
                      tier.highlighted ? "text-on-primary" : "text-primary"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      tier.highlighted
                        ? "text-on-primary/70"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        tier.highlighted ? "text-on-primary" : "text-primary"
                      }`}
                    >
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span
                        className={`text-sm ${
                          tier.highlighted
                            ? "text-on-primary/70"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {tier.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          tier.highlighted
                            ? "text-secondary-container"
                            : "text-secondary"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          tier.highlighted
                            ? "text-on-primary/90"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div
                  aria-disabled="true"
                  className={`block w-full text-center py-3 text-sm font-semibold rounded-xl cursor-not-allowed ${
                    tier.highlighted
                      ? "bg-surface-container-lowest/80 text-primary/70"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {tier.cta}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <motion.p
            {...fadeUp}
            className="text-center text-sm text-outline mt-8"
          >
            {PRICING_DISCLAIMER}
          </motion.p>
        </div>
      </section>

      {/* Enterprise Note */}
      <section className="section-atmosphere py-16 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            {...fadeUp}
            className="card-lift group flex flex-col items-center gap-8 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-8 shadow-ambient md:flex-row md:p-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-on-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-primary mb-2">
                Enterprise &amp; Multi-Site Deployments
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Enterprise pricing is still being finalised for larger and
                multi-site deployments. We will share launch timing, rollout
                details, and commercial options closer to release.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-on-surface-variant bg-surface-container rounded-full whitespace-nowrap">
              Coming Soon
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-3">
              Common Questions
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              Pricing FAQ
            </h2>
          </motion.div>

          <div className="space-y-3">
            {pricingFaqs.map((faq, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-lift group overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest/95 shadow-ambient-sm transition-shadow hover:shadow-ambient"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-semibold text-primary pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-outline shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
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
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Want first access when Miraa launches?
            </h2>
            <p className="text-on-surface-variant mb-8">
              Join the waitlist now. We will email you when the 14-day free
              trial goes live and sign-up is open.
            </p>
            <Link
              href="/#waitlist-form"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
            >
              Join the Waitlist
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
