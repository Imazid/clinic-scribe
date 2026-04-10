"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquareHeart, Rocket, ArrowRight } from "lucide-react";
import { EARLY_ACCESS_BENEFITS } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  MessageSquareHeart,
  Rocket,
};

export function EarlyAccessCTA() {
  return (
    <section className="bg-secondary-fixed py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary">Waitlist</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Join the waitlist for launch
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary/70">
            Miraa is not open for sign-up yet. Join the waitlist now and we will
            let you know when the app launches and when the 14-day free trial
            is available.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {EARLY_ACCESS_BENEFITS.map((benefit, i) => {
            const Icon = iconMap[benefit.icon];
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="rounded-xl bg-surface-container-lowest/80 p-6 shadow-ambient-sm backdrop-blur-sm transition-shadow hover:shadow-ambient"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10">
                  {Icon && <Icon className="h-5 w-5 text-secondary" />}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {benefit.description}
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
          className="mt-12 text-center"
        >
          <button
            onClick={() =>
              document
                .getElementById("waitlist-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-semibold text-on-primary transition-shadow hover:shadow-ambient-lg"
          >
            Join the Waitlist
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
