"use client";

import { motion } from "framer-motion";
import {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Lock,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BRAND, SAFETY_PRINCIPLES } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Lock,
  KeyRound,
};

export function SafetyFirst() {
  return (
    <section className="bg-primary py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary-fixed">
            Safety by Design
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-on-primary md:text-4xl">
            Clinician control at every step
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-on-primary/70">
            Safety is not an afterthought. Every feature is built around the
            principle that clinicians remain in full control.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY_PRINCIPLES.map((principle, i) => {
            const Icon = iconMap[principle.icon] || ShieldCheck;

            return (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl bg-white/10 p-6 backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-5 w-5 text-secondary-fixed" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-on-primary">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-primary/70">
                  {principle.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Callout box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mt-14 max-w-3xl rounded-2xl bg-white/5 p-8 text-center backdrop-blur-sm"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/20">
            <ShieldAlert className="h-6 w-6 text-error-container" />
          </div>
          <h3 className="text-xl font-bold text-on-primary">
            Not autonomous clinical decision-making
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-on-primary/70">
            {BRAND.name} assists with documentation only. It does not diagnose,
            prescribe, or make clinical decisions. The clinician is always
            responsible for clinical judgment, and every AI output must be
            reviewed and approved before it is finalised.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
