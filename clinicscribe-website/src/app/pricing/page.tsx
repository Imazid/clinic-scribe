"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ChevronDown, Building2 } from "lucide-react";
import Link from "next/link";
import { BRAND, PRICING_TIERS, PRICING_DISCLAIMER } from "@/lib/constants";
import { APP_URL } from "@/lib/config";

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
      "Yes. All plans include a 14-day free trial so you can evaluate the product with your actual clinical workflow before committing. A card is required at sign-up but you won't be charged until the trial ends, and you can cancel anytime.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle. We will help you find the right plan for your practice size.",
  },
  {
    question: "What counts as a clinician seat?",
    answer:
      "A clinician seat is for any healthcare professional who uses the ambient transcription and note generation features. Practice managers and administrative staff who only access the admin dashboard do not require a clinician seat.",
  },
  {
    question: "Do you offer discounts for larger practices?",
    answer:
      "Yes. The Group Practice tier offers volume pricing, and Enterprise plans include custom pricing tailored to your deployment. Contact our sales team for a quote based on your specific needs.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Pricing
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            Plans that scale with your practice. Start with a 14-day free
            trial — your card won&apos;t be charged until it ends.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  tier.highlighted
                    ? "bg-gradient-to-b from-primary to-primary-container text-on-primary shadow-ambient-lg ring-2 ring-secondary-container"
                    : "bg-surface-container-lowest shadow-ambient-sm"
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

                <Link
                  href={
                    tier.name === "Enterprise"
                      ? `/demo?plan=enterprise`
                      : `${APP_URL}/checkout?plan=${tier.name === "Group Practice" ? "group" : tier.name.toLowerCase()}`
                  }
                  className={`block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all ${
                    tier.highlighted
                      ? "bg-surface-container-lowest text-primary hover:bg-surface-container-low"
                      : "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-90"
                  }`}
                >
                  {tier.cta}
                </Link>
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
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            {...fadeUp}
            className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-ambient flex flex-col md:flex-row items-center gap-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-on-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-primary mb-2">
                Enterprise &amp; Multi-Site Deployments
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Custom pricing for larger multi-site deployments. Includes
                dedicated account management, custom integrations, on-premise
                deployment options, SLA guarantees, and compliance reporting
                tailored to your organisation.
              </p>
            </div>
            <Link
              href="/demo?plan=enterprise"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20 bg-surface">
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
                className="bg-surface-container-lowest rounded-xl shadow-ambient-sm overflow-hidden"
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
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-on-surface-variant mb-8">
              Start your 14-day free trial today. See how {BRAND.name} fits
              your clinical workflow.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
            >
              Book a Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
