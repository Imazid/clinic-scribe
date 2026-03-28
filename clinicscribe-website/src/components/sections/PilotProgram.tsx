"use client";

import { motion } from "framer-motion";
import { Rocket, Headphones, MessageSquareHeart, ArrowRight } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: Rocket,
    title: "Structured Onboarding",
    description:
      "Guided setup, training sessions, and a dedicated implementation window tailored to your practice workflow.",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description:
      "Direct access to our clinical and engineering teams throughout the pilot period for rapid issue resolution.",
  },
  {
    icon: MessageSquareHeart,
    title: "Shape the Product",
    description:
      "Your feedback directly influences product development. Pilot partners help define the features that matter most.",
  },
];

export function PilotProgram() {
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
          <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Join our pilot program
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary/70">
            Get early access to AI-powered clinical documentation with
            structured onboarding, hands-on support, and a direct feedback loop
            to our product team.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-xl bg-surface-container-lowest/80 p-6 shadow-ambient-sm backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10">
                <benefit.icon className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-primary">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-semibold text-on-primary transition-shadow hover:shadow-ambient-lg"
          >
            Apply for Early Access
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
