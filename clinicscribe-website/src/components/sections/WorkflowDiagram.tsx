"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Mic,
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle,
  ListChecks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  ClipboardList,
  Mic,
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle,
  ListChecks,
};

export function WorkflowDiagram() {
  return (
    <section className="section-atmosphere bg-surface-container-low py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary">Workflow</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            From visit prep to closeout in one workflow
          </h2>
        </motion.div>

        {/* Desktop: horizontal flow */}
        <div className="mt-16 hidden lg:block">
          <div className="relative grid grid-cols-6 gap-4">
            {/* Connecting line */}
            <div className="pointer-events-none absolute top-10 right-[8%] left-[8%] h-px border-t-2 border-dashed border-outline-variant" />
            <motion.div
              aria-hidden="true"
              className="workflow-beam pointer-events-none absolute top-[39px] left-[8%] h-[3px] w-[16%] rounded-full"
              animate={{ x: ["0%", "470%"] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />

            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = iconMap[step.icon] || CheckCircle;
              const isActive = step.step === 3; // Verification highlighted

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ y: -8 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl ${
                      isActive
                        ? "bg-secondary text-on-secondary shadow-ambient"
                        : "bg-surface-container-lowest text-primary shadow-ambient-sm"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-[-10px] rounded-[1.75rem] border border-secondary/30"
                        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.8, 0.35] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <Icon className="h-7 w-7" />
                    <span
                      className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-secondary-container text-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {step.step}
                    </span>
                  </div>
                  <h3
                    className={`mt-4 text-sm font-semibold ${
                      isActive ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet: vertical flow */}
        <div className="mt-14 space-y-0 lg:hidden">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = iconMap[step.icon] || CheckCircle;
            const isActive = step.step === 3;
            const isLast = i === WORKFLOW_STEPS.length - 1;

            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ x: 6 }}
                className="relative flex gap-5"
              >
                {/* Vertical line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container-lowest text-primary shadow-ambient-sm"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLast && (
                    <div className="my-1 h-full w-px border-l-2 border-dashed border-outline-variant" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <span className="label-text text-on-surface-variant">
                    Step {step.step}
                  </span>
                  <h3
                    className={`mt-1 font-semibold ${
                      isActive ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
