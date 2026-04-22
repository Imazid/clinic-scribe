"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck, MapPin, Plug } from "lucide-react";

type TrustTone = "active" | "planned" | "live";

const trustItems: Array<{
  icon: typeof Building2;
  label: string;
  status: string;
  tone: TrustTone;
}> = [
  { icon: Building2, label: "Pilot partner clinics", status: "Active", tone: "active" },
  { icon: ShieldCheck, label: "SOC 2 Type II", status: "Planned", tone: "planned" },
  { icon: MapPin, label: "Australian-first", status: "By design", tone: "live" },
  { icon: Plug, label: "FHIR compatible", status: "Built in", tone: "live" },
];

const toneStyles: Record<TrustTone, string> = {
  active: "bg-[#4F7A3A]/10 text-[#4F7A3A]",
  planned: "bg-secondary/10 text-secondary",
  live: "bg-tertiary/10 text-tertiary",
};

const toneDot: Record<TrustTone, string> = {
  active: "bg-[#4F7A3A]",
  planned: "bg-secondary",
  live: "bg-tertiary",
};

export function TrustBar() {
  const repeatedItems = [...trustItems, ...trustItems];

  return (
    <section className="bg-surface-container-low py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl px-6 lg:px-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          {/* Left eyebrow */}
          <div className="shrink-0 md:w-48">
            <p className="label-text text-secondary">Clinical trust</p>
            <p className="mt-1.5 text-sm text-on-surface-variant leading-snug">
              Built for the standards your clinic already expects.
            </p>
          </div>

          {/* Marquee */}
          <div className="marquee-fade relative flex-1 overflow-hidden">
            <div className="marquee-track flex items-center gap-3 pr-3">
              {repeatedItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={`${item.label}-${i}`}
                    aria-hidden={i >= trustItems.length}
                    className="group flex shrink-0 items-center gap-3 rounded-full border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 shadow-ambient-sm transition-shadow hover:shadow-ambient"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneStyles[item.tone]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-primary whitespace-nowrap">
                      {item.label}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${toneDot[item.tone]}`} />
                      <span className="text-[10px] tracking-[0.14em] uppercase font-bold text-on-surface-variant whitespace-nowrap">
                        {item.status}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
