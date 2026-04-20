"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="hero-gradient py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-on-primary md:text-4xl lg:text-5xl">
            Ready to reduce your documentation burden?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-on-primary/70">
            Join pilot clinics across Australia who are reclaiming hours every
            week. Get on the waitlist to hear when launch and your 14-day free
            trial open.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-8 py-4 font-semibold text-primary transition-shadow hover:shadow-ambient-lg"
            >
              Join the waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
