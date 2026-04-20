"use client";

import { motion } from "framer-motion";
import { ROI_METRICS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

function MetricDisplay({ metric }: { metric: string }) {
  if (metric === "2+ hours") {
    return (
      <>
        <AnimatedCounter target={2} className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl" suffix="+" />{" "}
        <span className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl">hours</span>
      </>
    );
  }
  if (metric === "70%") {
    return (
      <AnimatedCounter target={70} suffix="%" className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl" />
    );
  }
  return (
    <span className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl">
      {metric}
    </span>
  );
}

export function ROISection() {
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
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -10, scale: 1.01 }}
              className="card-lift group rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
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
          Metrics are based on early pilot estimates and published research on
          consult workflow burden. Actual results vary by practice size,
          consultation volume, and workflow. These figures should not be taken as
          guarantees.
        </motion.p>
      </div>
    </section>
  );
}
