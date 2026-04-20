"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BRAND, FAQS } from "@/lib/constants";

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

// Categorize FAQs based on content keywords
function categorize(question: string): string {
  const q = question.toLowerCase();
  if (
    q.includes("pricing") ||
    q.includes("pilot") ||
    q.includes("trial") ||
    q.includes("plan")
  )
    return "Pricing";
  if (
    q.includes("safety") ||
    q.includes("replace") ||
    q.includes("error") ||
    q.includes("prescri") ||
    q.includes("consent") ||
    q.includes("judgment")
  )
    return "Safety";
  if (
    q.includes("integrat") ||
    q.includes("system") ||
    q.includes("data") ||
    q.includes("telehealth")
  )
    return "Technical";
  return "Product";
}

const categorized = FAQS.reduce<
  Record<string, { question: string; answer: string }[]>
>((acc, faq) => {
  const cat = categorize(faq.question);
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(faq);
  return acc;
}, {});

const categoryOrder = ["Product", "Safety", "Technical", "Pricing"];

export default function FaqPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <>
      {/* Hero */}
      <section className="section-atmosphere overflow-hidden bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            FAQ
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            Everything you need to know about {BRAND.name}. If your question is
            not here, contact us at{" "}
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="text-secondary hover:underline"
            >
              {BRAND.supportEmail}
            </a>
            .
          </motion.p>
        </div>
      </section>

      {/* FAQ Sections by Category */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6">
          {categoryOrder
            .filter((cat) => categorized[cat])
            .map((category, catIdx) => (
              <div key={category} className={catIdx > 0 ? "mt-12" : ""}>
                <motion.h2
                  {...fadeUp}
                  className="text-xl font-bold text-primary mb-4 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  {category}
                </motion.h2>

                <div className="space-y-3">
                  {categorized[category].map((faq, i) => {
                    const faqId = `${category}-${i}`;
                    const isOpen = openFaq === faqId;
                    return (
                      <motion.div
                        key={faqId}
                        {...stagger}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="card-lift group overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest/95 shadow-ambient-sm transition-shadow hover:shadow-ambient"
                      >
                        <button
                          onClick={() => toggleFaq(faqId)}
                          className="w-full flex items-center justify-between p-5 text-left"
                        >
                          <span className="text-sm font-semibold text-primary pr-4">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-outline shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
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
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Still Have Questions?
            </h2>
            <p className="text-on-surface-variant mb-8">
              Join the waitlist for launch updates, or reach out to our team
              directly if you need more detail now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant/25 bg-surface-container-lowest px-8 py-3.5 text-sm font-semibold text-primary shadow-ambient-sm transition-colors hover:bg-surface-container"
              >
                Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
