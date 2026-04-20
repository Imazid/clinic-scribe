"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Monitor,
  ShieldCheck,
  Users,
  CheckCircle,
  Stethoscope,
  Building2,
  Headphones,
} from "lucide-react";
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

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const benefits = [
  {
    icon: Monitor,
    title: "Personalised Walkthrough",
    description:
      "See the full workflow tailored to your specialty — from consult prep and capture to approved outputs.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Architecture Deep-Dive",
    description:
      "Understand the mandatory review gates, audit trails, and confidence indicators that keep clinicians in control.",
  },
  {
    icon: Clock,
    title: "Integration Assessment",
    description:
      "Discuss how Miraa integrates with your current clinical software, PMS, and daily workflow.",
  },
];

const timelineSteps = [
  {
    step: "01",
    title: "Join the Waitlist",
    description: "Sign up with your email and tell us about your practice.",
  },
  {
    step: "02",
    title: "Get Priority Access",
    description: "Early supporters receive founding member pricing and priority onboarding.",
  },
  {
    step: "03",
    title: "Personalised Onboarding",
    description: "A walkthrough tailored to your specialty and clinical workflow.",
  },
  {
    step: "04",
    title: "Go Live",
    description: "Start capturing consultations and reviewing AI-drafted notes from day one.",
  },
];

const audienceCards = [
  {
    icon: Stethoscope,
    title: "General Practitioners",
    description: "High-volume consults, repeat patterns, structured closeout.",
  },
  {
    icon: Building2,
    title: "Specialist Practices",
    description: "Detailed procedure notes, specialty formats, referral letters.",
  },
  {
    icon: Headphones,
    title: "Telehealth Providers",
    description: "Same workflow whether the consult is in-room or on-screen.",
  },
];

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Background decoration */}
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
                  <Calendar className="h-3.5 w-3.5" />
                  Coming Soon
                </span>
              </motion.div>

              <motion.h1
                variants={item}
                className="mt-6 text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl"
              >
                Demos are{" "}
                <span className="gradient-text">on the way</span>
              </motion.h1>

              <motion.p
                variants={item}
                className="mt-6 text-lg leading-relaxed text-on-surface-variant"
              >
                We&apos;re not quite ready for personalised demos yet, but
                we&apos;re getting close. Join the waitlist to be first in line
                when {BRAND.shortName} launches — and lock in founding member
                pricing.
              </motion.p>

              <motion.div
                variants={item}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/waitlist"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-semibold text-on-primary transition-shadow hover:shadow-ambient-lg"
                >
                  Join the Waitlist
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-8 py-4 font-semibold text-primary transition-colors hover:bg-surface-container-highest"
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>

            {/* Right — Illustration card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="relative"
            >
              <div className="rounded-2xl bg-surface-container-lowest p-1 shadow-ambient-lg">
                {/* Window chrome */}
                <div className="flex items-center gap-2 rounded-t-xl bg-surface-container-low px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-error/60" />
                  <span className="h-3 w-3 rounded-full bg-[#f5c542]/70" />
                  <span className="h-3 w-3 rounded-full bg-[#34c759]/60" />
                  <span className="ml-3 text-xs font-medium text-on-surface-variant">
                    Your Demo &mdash; Pending
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/30 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                    </span>
                    Preparing...
                  </span>
                </div>

                {/* Simulated demo agenda */}
                <div className="space-y-4 px-5 py-5">
                  {[
                    {
                      time: "0–5 min",
                      title: "Your Practice Profile",
                      desc: "We learn your specialty, PMS, and daily workflow.",
                    },
                    {
                      time: "5–15 min",
                      title: "Live Product Walkthrough",
                      desc: "Prepare → Capture → Verify → Close — tailored to your setup.",
                    },
                    {
                      time: "15–25 min",
                      title: "Safety & Integration",
                      desc: "Review gates, audit trails, and how Miraa connects to your systems.",
                    },
                    {
                      time: "25–30 min",
                      title: "Q&A + Next Steps",
                      desc: "Ask anything. We'll outline onboarding and timeline.",
                    },
                  ].map((slot, i) => (
                    <motion.div
                      key={slot.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
                      className="flex gap-4"
                    >
                      <div className="flex w-16 shrink-0 items-start justify-center">
                        <span className="rounded-md bg-secondary-fixed/20 px-2 py-0.5 text-[0.65rem] font-bold text-secondary">
                          {slot.time}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {slot.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">
                          {slot.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 rounded-xl bg-surface-container-lowest px-4 py-3 shadow-ambient"
              >
                <p className="text-xs font-semibold text-primary">
                  30-minute session
                </p>
                <p className="mt-0.5 text-[0.65rem] text-on-surface-variant">
                  No obligation, no pressure
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What to Expect — Benefit cards */}
      <section className="bg-surface-container-low py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="label-text text-secondary">What to Expect</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              A demo built around your workflow
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
              Every demo is tailored to your practice — your specialty, your
              PMS, your daily flow.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="rounded-xl bg-surface-container-lowest/80 p-6 shadow-ambient-sm backdrop-blur-sm transition-shadow hover:shadow-ambient"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10">
                  <benefit.icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built For section */}
      <section className="bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="label-text text-secondary">Built For</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Designed for the way clinicians actually work
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {audienceCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative overflow-hidden rounded-2xl bg-surface-container-lowest p-8 shadow-ambient-sm transition-shadow hover:shadow-ambient"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-secondary-fixed/10 transition-transform group-hover:scale-150" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                    <card.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-primary">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline — How It Works */}
      <section className="bg-surface-container-low py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="label-text text-secondary">How It Works</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              From waitlist to live in four steps
            </h2>
          </motion.div>

          <div className="relative mt-16">
            {/* Connector line (desktop) */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-outline-variant/40 lg:block" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {timelineSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative text-center lg:text-left"
                >
                  {/* Step number */}
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-ambient-sm lg:mx-0">
                    <span className="text-lg font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                label: "Australian-Hosted Data",
                sublabel: "Sovereign compliance from day one",
              },
              {
                icon: Users,
                label: "Clinician-Reviewed Outputs",
                sublabel: "Nothing saves without sign-off",
              },
              {
                icon: CheckCircle,
                label: "No Lock-In",
                sublabel: "Cancel anytime, export everything",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-ambient-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-fixed/20">
                  <item.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {item.label}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {item.sublabel}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary-fixed py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="label-text text-secondary">
              Limited Early Access
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Ready to see {BRAND.shortName} in action?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary/70">
              Join the waitlist today. Early supporters get founding member
              pricing and priority onboarding when demos open.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-semibold text-on-primary transition-shadow hover:shadow-ambient-lg"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/80 px-8 py-4 font-semibold text-primary backdrop-blur-sm transition-shadow hover:shadow-ambient"
              >
                <ShieldCheck className="h-4 w-4" />
                Safety Architecture
              </Link>
            </div>

            <p className="mt-6 text-sm text-primary/50">
              Or explore the{" "}
              <Link
                href="/product"
                className="text-secondary underline decoration-secondary/30 underline-offset-2 hover:decoration-secondary"
              >
                product workflow
              </Link>{" "}
              or{" "}
              <Link
                href="/integrations"
                className="text-secondary underline decoration-secondary/30 underline-offset-2 hover:decoration-secondary"
              >
                integrations
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
