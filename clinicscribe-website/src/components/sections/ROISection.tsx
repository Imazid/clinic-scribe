"use client";

import { motion } from "framer-motion";
import { ROI_METRICS } from "@/lib/constants";

export function ROISection() {
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
          <span className="label-text text-secondary">The Business Case</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Measurable impact on your practice
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROI_METRICS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient-sm"
            >
              <p className="gradient-text text-4xl font-extrabold tracking-tight lg:text-5xl">
                {item.metric}
              </p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
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
          clinical documentation burden. Actual results vary by practice size,
          consultation volume, and workflow. These figures should not be taken as
          guarantees.
        </motion.p>
      </div>
    </section>
  );
}
