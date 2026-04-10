"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRightCircle, Circle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROADMAP } from "@/lib/constants";

const statusConfig: Record<
  string,
  { icon: LucideIcon; badge: string; badgeBg: string; badgeText: string; accent: string }
> = {
  current: {
    icon: CheckCircle,
    badge: "Current",
    badgeBg: "bg-[#34c759]/15",
    badgeText: "text-[#1a7a34]",
    accent: "border-secondary",
  },
  next: {
    icon: ArrowRightCircle,
    badge: "Next",
    badgeBg: "bg-secondary-fixed/30",
    badgeText: "text-secondary",
    accent: "border-secondary/40",
  },
  future: {
    icon: Circle,
    badge: "Future",
    badgeBg: "bg-surface-container-high",
    badgeText: "text-on-surface-variant",
    accent: "border-outline-variant",
  },
};

export function Roadmap() {
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
          <span className="label-text text-secondary">Product Roadmap</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Where we&apos;re headed
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {ROADMAP.map((phase, i) => {
            const config = statusConfig[phase.status] || statusConfig.future;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -10 }}
                className={`card-lift relative rounded-2xl border-t-4 bg-surface-container-lowest/95 p-8 shadow-ambient-sm ${config.accent}`}
              >
                <div className="flex items-center justify-between">
                  <span className="label-text text-on-surface-variant">
                    {phase.phase}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {config.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-primary">
                  {phase.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-relaxed text-on-surface-variant"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-outline-variant" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
