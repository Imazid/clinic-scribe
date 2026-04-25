"use client";

import { motion } from "framer-motion";
import { Sparkles, Compass, Mountain } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROADMAP } from "@/lib/constants";
import { AnimatedTimeline, type TimelineItem } from "@/components/ui/AnimatedTimeline";

const phaseIcons: LucideIcon[] = [Sparkles, Compass, Mountain];

const badgeForStatus: Record<string, { label: string; tone: "current" | "next" | "future" }> = {
  current: { label: "Current", tone: "current" },
  next: { label: "Next", tone: "next" },
  future: { label: "Future", tone: "future" },
};

export function Roadmap() {
  const items: TimelineItem[] = ROADMAP.map((phase, i) => ({
    key: phase.phase,
    eyebrow: phase.phase,
    title: phase.title,
    badge: badgeForStatus[phase.status],
    icon: phaseIcons[i] ?? Sparkles,
    body: (
      <ul className="space-y-2.5">
        {phase.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-on-surface-variant"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/60" />
            {item}
          </li>
        ))}
      </ul>
    ),
  }));

  return (
    <section className="section-atmosphere bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary">Product Roadmap</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Where we&apos;re headed
          </h2>
          <p className="mt-4 text-on-surface-variant leading-relaxed">
            Three phases. Built deliberately, shipped openly.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-3xl">
          <AnimatedTimeline items={items} />
        </div>
      </div>
    </section>
  );
}
