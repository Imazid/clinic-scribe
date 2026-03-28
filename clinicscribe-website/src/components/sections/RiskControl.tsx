"use client";

import { motion } from "framer-motion";
import {
  Gauge,
  ShieldCheck,
  ScrollText,
  Pill,
  Fingerprint,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Control {
  icon: LucideIcon;
  title: string;
  description: string;
}

const controls: Control[] = [
  {
    icon: Gauge,
    title: "Confidence Checks",
    description:
      "AI outputs are scored for confidence. Low-certainty sections are flagged for clinician attention before review.",
  },
  {
    icon: ShieldCheck,
    title: "Review Gates",
    description:
      "Mandatory approval workflows ensure no note, referral, or prescription draft is finalised without clinician sign-off.",
  },
  {
    icon: ScrollText,
    title: "Audit Logs",
    description:
      "Every AI draft, edit, and approval is logged with timestamps. Complete traceability for governance and compliance.",
  },
  {
    icon: Pill,
    title: "Medication Validation",
    description:
      "Prescription drafts include structured checks. Clinicians verify drug, dose, and frequency before the script proceeds.",
  },
  {
    icon: Fingerprint,
    title: "Traceability",
    description:
      "All outputs link back to their source transcript, clinician edits, and approval actions for full provenance.",
  },
];

export function RiskControl() {
  return (
    <section className="bg-surface-container-low py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary">Safeguards</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Built-in controls at every step
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
            Multiple layers of validation ensure safety, accuracy, and full
            auditability across every clinical output.
          </p>
        </motion.div>

        {/* Desktop horizontal flow */}
        <div className="mt-16 hidden lg:block">
          <div className="relative grid grid-cols-5 gap-4">
            {/* Connecting line */}
            <div className="pointer-events-none absolute top-12 right-[10%] left-[10%] flex items-center">
              <div className="h-px w-full border-t-2 border-dashed border-secondary/30" />
            </div>

            {controls.map((control, i) => (
              <motion.div
                key={control.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-ambient-sm">
                  <control.icon className="h-8 w-8 text-secondary" />
                </div>
                {/* Arrow between items */}
                {i < controls.length - 1 && (
                  <div className="pointer-events-none absolute top-12 -right-2 z-20 text-secondary/40">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2 2L10 6L2 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
                <h3 className="mt-4 text-sm font-semibold text-primary">
                  {control.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                  {control.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: card grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:hidden">
          {controls.map((control, i) => (
            <motion.div
              key={control.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-fixed/20">
                <control.icon className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="mt-4 font-semibold text-primary">
                {control.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                {control.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
