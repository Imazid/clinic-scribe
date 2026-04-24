"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type TimelineItem = {
  key: string;
  eyebrow?: string;
  title: string;
  badge?: { label: string; tone: "current" | "next" | "future" };
  icon?: LucideIcon;
  body: ReactNode;
};

type AnimatedTimelineProps = {
  items: TimelineItem[];
  className?: string;
};

const toneStyles: Record<
  NonNullable<TimelineItem["badge"]>["tone"],
  { dot: string; badgeBg: string; badgeText: string; ring: string }
> = {
  current: {
    dot: "bg-tertiary",
    badgeBg: "bg-tertiary/10",
    badgeText: "text-tertiary",
    ring: "ring-tertiary/30",
  },
  next: {
    dot: "bg-secondary",
    badgeBg: "bg-secondary/10",
    badgeText: "text-secondary",
    ring: "ring-secondary/30",
  },
  future: {
    dot: "bg-outline-variant",
    badgeBg: "bg-surface-container-high",
    badgeText: "text-on-surface-variant",
    ring: "ring-outline-variant/40",
  },
};

export function AnimatedTimeline({ items, className }: AnimatedTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 30%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.4,
  });

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {/* Rail track */}
      <div
        aria-hidden="true"
        className="absolute left-[19px] top-2 bottom-2 w-[2px] rounded-full bg-outline-variant/50 md:left-[23px]"
      />
      {/* Rail fill */}
      <motion.div
        aria-hidden="true"
        style={reduced ? { transform: "scaleY(1)" } : { scaleY, originY: 0 }}
        className="absolute left-[19px] top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-secondary via-tertiary to-secondary md:left-[23px]"
      />

      <ol className="relative space-y-10">
        {items.map((item, i) => {
          const tone = item.badge ? toneStyles[item.badge.tone] : toneStyles.future;
          const Icon = item.icon;
          return (
            <motion.li
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex gap-5 md:gap-7"
            >
              {/* Dot */}
              <div className="relative z-10 flex shrink-0 items-start pt-1">
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-ambient-sm ring-1 ${tone.ring}`}
                >
                  {Icon ? (
                    <Icon className={`h-4 w-4 ${tone.badgeText}`} />
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                  )}
                </span>
              </div>

              {/* Card */}
              <motion.div
                whileHover={reduced ? undefined : { y: -4 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="card-lift flex-1 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/95 p-6 shadow-ambient-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  {item.eyebrow ? (
                    <span className="label-text text-on-surface-variant">
                      {item.eyebrow}
                    </span>
                  ) : (
                    <span />
                  )}
                  {item.badge && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${tone.badgeBg} ${tone.badgeText}`}
                    >
                      {item.badge.label}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-xl font-bold text-primary">{item.title}</h3>
                <div className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                  {item.body}
                </div>
              </motion.div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
