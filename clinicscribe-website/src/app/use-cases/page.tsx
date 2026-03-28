"use client";

import { motion } from "framer-motion";
import {
  Stethoscope,
  Brain,
  Video,
  Heart,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { BRAND, USE_CASES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  Brain,
  Video,
  Heart,
};

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

export default function UseCasesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Use Cases
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            Built for Every Practice
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            See how {BRAND.name} fits your workflow — whether you are a solo GP,
            specialist clinic, telehealth provider, or allied health
            professional.
          </motion.p>
        </div>
      </section>

      {/* Use Case Sections */}
      {USE_CASES.map((useCase, idx) => {
        const Icon = iconMap[useCase.icon] || Stethoscope;
        const isEven = idx % 2 === 0;
        return (
          <section
            key={useCase.title}
            className={`py-20 ${
              isEven ? "bg-surface" : "bg-surface-container-low"
            }`}
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Text Content */}
                <motion.div
                  {...fadeUp}
                  className={isEven ? "order-1" : "order-1 lg:order-2"}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                      {useCase.title}
                    </h2>
                  </div>

                  {/* Pain Point */}
                  <div className="bg-surface-container-high/50 rounded-xl p-5 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-outline mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs label-text text-outline mb-1">
                          The Challenge
                        </p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {useCase.painPoint}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Benefit */}
                  <div className="bg-secondary/5 rounded-xl p-5 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs label-text text-secondary mb-1">
                          How {BRAND.shortName} Helps
                        </p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {useCase.benefit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Why AI */}
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs label-text text-primary mb-1">
                        Why AI Works Here
                      </p>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {useCase.whyAI}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Output Cards */}
                <motion.div
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={isEven ? "order-2" : "order-2 lg:order-1"}
                >
                  <p className="label-text text-secondary mb-4">
                    Generated Outputs
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {useCase.outputs.map((output, oi) => (
                      <motion.div
                        key={oi}
                        {...stagger}
                        transition={{ duration: 0.4, delay: oi * 0.08 }}
                        className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient-sm hover:shadow-ambient transition-shadow"
                      >
                        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                          <FileText className="w-4 h-4 text-secondary" />
                        </div>
                        <h4 className="text-sm font-semibold text-primary mb-1">
                          {output}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          AI-drafted, clinician-reviewed before saving
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Clinician review reminder */}
                  <div className="mt-6 bg-surface-container rounded-xl p-4">
                    <p className="text-xs text-on-surface-variant">
                      <strong className="text-primary">
                        Clinician review required:
                      </strong>{" "}
                      All outputs are presented as drafts for clinician review
                      and approval before being saved or exported.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              See How It Works for Your Specialty
            </h2>
            <p className="text-on-surface-variant mb-8">
              Book a personalised demo tailored to your practice type and
              clinical workflow.
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
