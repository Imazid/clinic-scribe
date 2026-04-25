"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ROI_METRICS } from "@/lib/constants";
import { ScrollNumber } from "@/components/ui/ScrollNumber";

function HoursMetric() {
  return (
    <span className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl">
      <ScrollNumber from={0} to={2} suffix="+" /> <span>hours</span>
    </span>
  );
}

function PercentMetric() {
  return (
    <ScrollNumber
      from={0}
      to={70}
      suffix="%"
      className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl"
    />
  );
}

function MetricDisplay({ metric }: { metric: string }) {
  if (metric === "2+ hours") return <HoursMetric />;
  if (metric === "70%") return <PercentMetric />;
  return (
    <span className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl">
      {metric}
    </span>
  );
}

function HoursBar() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "center 60%"],
  });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "85%"]);
  return (
    <div ref={ref} className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-outline-variant/40">
      <motion.div
        style={{ width }}
        className="h-full rounded-full bg-gradient-to-r from-secondary via-tertiary to-secondary"
      />
    </div>
  );
}

function PercentRing() {
  const ref = useRef<HTMLDivElement>(null);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "center 60%"],
  });
  const offset = useTransform(
    scrollYProgress,
    [0, 1],
    [circumference, circumference * (1 - 0.7)]
  );
  return (
    <div ref={ref} className="mt-4 flex items-center gap-3">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="var(--color-outline-variant)"
          strokeOpacity="0.4"
          strokeWidth="3"
          fill="none"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          stroke="url(#roi-ring-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
        />
        <defs>
          <linearGradient id="roi-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-secondary)" />
            <stop offset="100%" stopColor="var(--color-tertiary)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
        After-hours
        <br />
        documentation
      </span>
    </div>
  );
}

export function ROISection() {
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
          <span className="label-text text-secondary">The Business Case</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Measurable impact on your practice
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROI_METRICS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -10, scale: 1.01 }}
              className="card-lift group relative rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(228,238,245,0.4),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="relative">
                <MetricDisplay metric={item.metric} />
              </p>
              <p className="relative mt-3 text-sm font-semibold text-primary">
                {item.label}
              </p>
              <p className="relative mt-2 text-sm leading-relaxed text-on-surface-variant">
                {item.description}
              </p>
              {item.metric === "2+ hours" && <HoursBar />}
              {item.metric === "70%" && <PercentRing />}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-outline"
        >
          Metrics are based on early pilot estimates and published research on consult workflow burden. Actual results vary by practice size, consultation volume, and workflow. These figures should not be taken as guarantees.
        </motion.p>
      </div>
    </section>
  );
}
