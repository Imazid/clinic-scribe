"use client";

import { motion } from "framer-motion";
import { CalendarClock, Layers, Files, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PainPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

const painPoints: PainPoint[] = [
  {
    icon: CalendarClock,
    title: "Pre-Visit Catch-Up",
    description:
      "Clinicians still spend time before the consult reviewing charts, medications, and unresolved tasks across multiple systems.",
  },
  {
    icon: Layers,
    title: "Fragmented Workflow",
    description:
      "Switching between context, capture, review, and follow-up tools creates friction and increases the risk of missed details.",
  },
  {
    icon: Files,
    title: "Loop Closure Gaps",
    description:
      "Plans get documented, but reminders, recalls, and patient-facing instructions often live in separate systems or inboxes.",
  },
  {
    icon: AlertTriangle,
    title: "Verification Debt",
    description:
      "Without provenance and QA, clinicians have to re-read, cross-check, and manually reconcile every generated note.",
  },
];

export function Problem() {
  return (
    <section className="section-atmosphere bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="label-text text-secondary">The Challenge</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            The consult does not start when the patient walks in
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
            The real work begins before the visit, continues during the consult,
            and finishes only when the plan has been checked and closed out.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -10, scale: 1.01 }}
              className="card-lift group rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,216,207,0.5),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-error-container/50 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <point.icon className="h-5 w-5 text-error" />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold text-primary">
                {point.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-on-surface-variant">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
