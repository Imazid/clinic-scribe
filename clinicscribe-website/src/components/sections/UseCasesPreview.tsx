"use client";

import { motion } from "framer-motion";
import { Stethoscope, Brain, Video, Heart, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { USE_CASES } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Brain,
  Video,
  Heart,
};

export function UseCasesPreview() {
  return (
    <section className="bg-surface-container-low py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary">Who It&apos;s For</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Built for every type of practice
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((useCase, i) => {
            const Icon = iconMap[useCase.icon] || Stethoscope;

            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-xl bg-surface-container-lowest p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-fixed/20">
                  <Icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary">
                  {useCase.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {useCase.benefit.split(".")[0]}.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {useCase.outputs.slice(0, 3).map((output) => (
                    <span
                      key={output}
                      className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-[0.65rem] font-medium text-on-surface-variant"
                    >
                      {output}
                    </span>
                  ))}
                </div>
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
            href="/use-cases"
            className="inline-flex items-center gap-2 font-semibold text-secondary transition-colors hover:text-secondary/80"
          >
            Explore all use cases
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
