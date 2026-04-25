"use client";

import { motion } from "framer-motion";
import {
  Mic,
  FileText,
  Sparkles,
  Receipt,
  ListChecks,
  MessageSquareHeart,
  ShieldCheck,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FEATURES } from "@/lib/constants";
import { TiltCard } from "@/components/ui/TiltCard";

const iconMap: Record<string, LucideIcon> = {
  Mic,
  FileText,
  Sparkles,
  Receipt,
  ListChecks,
  MessageSquareHeart,
  ShieldCheck,
  Lock,
};

const tagColors: Record<string, { bg: string; text: string }> = {
  Core: { bg: "bg-secondary-fixed/40", text: "text-secondary" },
  Workflow: { bg: "bg-primary/10", text: "text-primary" },
  Assist: { bg: "bg-warning-container/50", text: "text-[#8a6d00]" },
  Safety: { bg: "bg-error-container/50", text: "text-error" },
};

export function FeatureGrid() {
  return (
    <section className="section-atmosphere bg-surface py-24 lg:py-32">
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
            Everything you need to prepare, capture, verify, and close the visit
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon] || FileText;
            const colors = tagColors[feature.tag] || tagColors.Core;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <TiltCard className="h-full" max={5}>
                  <div className="card-lift group relative h-full cursor-default rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(228,238,245,0.4),transparent_34%,rgba(58,46,34,0.02)_90%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-fixed/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="h-5 w-5 text-secondary" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                      >
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="relative mt-5 text-lg font-semibold text-primary">
                      {feature.title}
                    </h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {feature.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
