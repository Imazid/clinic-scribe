"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const mockupItem = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" as const, delay: 0.3 },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-secondary-fixed/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left — Copy */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <motion.div variants={item}>
              <span className="label-text inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/20 px-3 py-1 text-secondary">
                <Sparkles className="h-3.5 w-3.5" />
                {BRAND.tagline}
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl"
            >
              Spend more time with patients.{" "}
              <span className="gradient-text">Less time on paperwork.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-lg leading-relaxed text-on-surface-variant"
            >
              {BRAND.shortName} listens during consultations, drafts structured
              clinical notes with AI, and puts the clinician in full control.
              Every note is reviewed and approved before it leaves the system.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-semibold text-on-primary transition-shadow hover:shadow-ambient-lg"
              >
                Book a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-8 py-4 font-semibold text-primary transition-colors hover:bg-surface-container-highest"
              >
                <Play className="h-4 w-4" />
                See How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Product mockup */}
          <motion.div
            variants={mockupItem}
            initial="hidden"
            animate="show"
            className="relative"
          >
            <div className="rounded-2xl bg-surface-container-lowest p-1 shadow-ambient-lg">
              {/* Window chrome */}
              <div className="flex items-center gap-2 rounded-t-xl bg-surface-container-low px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-error/60" />
                <span className="h-3 w-3 rounded-full bg-[#f5c542]/70" />
                <span className="h-3 w-3 rounded-full bg-[#34c759]/60" />
                <span className="ml-3 text-xs font-medium text-on-surface-variant">
                  Clinical Note &mdash; Draft
                </span>
                {/* Reviewing badge */}
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/30 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                  </span>
                  Reviewing...
                </span>
              </div>

              {/* Note content */}
              <div className="space-y-4 px-5 py-5">
                {/* SOAP sections */}
                {[
                  {
                    label: "Subjective",
                    text: "Patient reports intermittent chest tightness over the past 2 weeks, worse with exertion. Denies palpitations or syncope. No recent illness or travel.",
                  },
                  {
                    label: "Objective",
                    text: "BP 132/84, HR 78 regular, SpO2 98% RA. Chest clear bilaterally. Heart sounds dual, no murmurs. No peripheral oedema.",
                  },
                  {
                    label: "Assessment",
                    text: "Exertional chest tightness \u2014 likely musculoskeletal vs. cardiac workup indicated given risk profile.",
                  },
                  {
                    label: "Plan",
                    text: "ECG today. Refer cardiology if ECG abnormal. Review bloods (FBC, UEC, lipids, troponin). Follow-up 1 week.",
                  },
                ].map((section, i) => (
                  <motion.div
                    key={section.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
                  >
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">
                      {section.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                      {section.text}
                    </p>
                  </motion.div>
                ))}

                {/* Confidence bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="mt-2 rounded-lg bg-surface-container-low px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                      AI Confidence
                    </span>
                    <span className="text-xs font-bold text-secondary">
                      94%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary-container"
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 rounded-xl bg-surface-container-lowest px-4 py-3 shadow-ambient"
            >
              <p className="text-xs font-semibold text-primary">
                Clinician approval required
              </p>
              <p className="mt-0.5 text-[0.65rem] text-on-surface-variant">
                Nothing saves without sign-off
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
