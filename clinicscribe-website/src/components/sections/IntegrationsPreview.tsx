"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { INTEGRATIONS } from "@/lib/constants";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-[#34c759]/15", text: "text-[#1a7a34]", label: "Available" },
  pilot: { bg: "bg-secondary-fixed/30", text: "text-secondary", label: "Pilot" },
  planned: { bg: "bg-surface-container-high", text: "text-on-surface-variant", label: "Planned" },
};

export function IntegrationsPreview() {
  const previewIntegrations = INTEGRATIONS.slice(0, 6);

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
          <span className="label-text text-secondary">Integrations</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Works with the systems your clinic already uses
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {previewIntegrations.map((integration, i) => {
            const style = statusStyles[integration.status] || statusStyles.planned;

            return (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-primary">
                    {integration.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {integration.description}
                </p>
                <p className="mt-3 text-xs text-outline">
                  {integration.category}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 font-semibold text-secondary transition-colors hover:text-secondary/80"
          >
            View all integrations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
