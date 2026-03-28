"use client";

import { motion } from "framer-motion";
import { Clock, Layers, Files, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PainPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

const painPoints: PainPoint[] = [
  {
    icon: Clock,
    title: "After-Hours Charting",
    description:
      "Clinicians routinely finish clinical notes at home, eating into personal time and accelerating burnout across the profession.",
  },
  {
    icon: Layers,
    title: "Fragmented Workflows",
    description:
      "Switching between transcription tools, clinical software, and billing systems creates friction and increases the risk of errors.",
  },
  {
    icon: Files,
    title: "Admin Overload",
    description:
      "Studies show clinicians spend 2+ hours per day on paperwork \u2014 time that could be spent on direct patient care.",
  },
  {
    icon: AlertTriangle,
    title: "Inconsistent Documentation",
    description:
      "Note quality varies between clinicians and sessions, creating gaps in clinical records and complicating handovers.",
  },
];

export function Problem() {
  return (
    <section className="bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="label-text text-secondary">The Challenge</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            The documentation burden is real
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
            Clinical documentation consumes hours every day, pulling clinicians
            away from the work that matters most.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-error-container/40">
                <point.icon className="h-5 w-5 text-error" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-primary">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
