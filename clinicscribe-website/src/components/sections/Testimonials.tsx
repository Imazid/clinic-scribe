"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";

export function Testimonials() {
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
          <span className="label-text text-secondary">From the Clinic</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            What pilot clinicians are saying
          </h2>
          <p className="mt-3 text-sm text-outline">
            Testimonials from pilot program participants
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -10, scale: 1.01 }}
              className="card-lift group relative rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-8 shadow-ambient-sm transition-shadow hover:shadow-ambient"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(161,239,255,0.24),transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Quote className="relative mb-4 h-8 w-8 text-secondary-fixed transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <blockquote className="relative text-sm leading-relaxed text-on-surface-variant">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="relative mt-6 flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {testimonial.role} &middot; {testimonial.clinic}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
