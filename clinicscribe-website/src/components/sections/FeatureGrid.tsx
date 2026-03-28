"use client";

import { motion } from "framer-motion";
import {
  Mic,
  FileText,
  Send,
  Receipt,
  ListChecks,
  Pill,
  ShieldCheck,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Mic,
  FileText,
  Send,
  Receipt,
  ListChecks,
  Pill,
  ShieldCheck,
  Lock,
};

const tagColors: Record<string, { bg: string; text: string }> = {
  Core: { bg: "bg-secondary-fixed/30", text: "text-secondary" },
  Workflow: { bg: "bg-primary/10", text: "text-primary" },
  Assist: { bg: "bg-[#f5c542]/20", text: "text-[#8a6d00]" },
  Safety: { bg: "bg-error-container/40", text: "text-error" },
};

export function FeatureGrid() {
  return (
    <section className="bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary">Capabilities</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Everything you need to streamline clinical documentation
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon] || FileText;
            const colors = tagColors[feature.tag] || tagColors.Core;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-fixed/20">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                  >
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
