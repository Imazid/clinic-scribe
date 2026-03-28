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
  return (
    <section className="bg-surface-container-low">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl px-6 py-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <item.icon className="h-4 w-4 text-outline" />
              <span className="label-text text-outline">{item.label}</span>
              {i < trustItems.length - 1 && (
                <span className="ml-10 hidden h-4 w-px bg-outline-variant lg:block" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
