"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck, MapPin, Plug } from "lucide-react";

const trustItems = [
  { icon: Building2, label: "Pilot Partner Clinics" },
  { icon: ShieldCheck, label: "SOC 2 Type II (Planned)" },
  { icon: MapPin, label: "Australian-First" },
  { icon: Plug, label: "FHIR Compatible" },
];

export function TrustBar() {
  const repeatedItems = [...trustItems, ...trustItems];

  return (
    <section className="section-atmosphere bg-surface-container-low">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl px-6 py-6 lg:px-8"
      >
        <div className="marquee-fade overflow-hidden rounded-full border border-outline-variant/30 bg-surface-container-lowest/70 px-3 py-3 shadow-ambient-sm backdrop-blur-sm">
          <div className="marquee-track flex items-center gap-3 pr-3">
            {repeatedItems.map((item, i) => (
              <div
                key={`${item.label}-${i}`}
                aria-hidden={i >= trustItems.length}
                className="flex items-center gap-3 whitespace-nowrap rounded-full border border-outline-variant/25 bg-white/70 px-4 py-2"
              >
                <item.icon className="h-4 w-4 text-secondary" />
                <span className="label-text text-outline">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
