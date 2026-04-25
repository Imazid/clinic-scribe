"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { DualMarquee } from "@/components/ui/DualMarquee";

type Testimonial = (typeof TESTIMONIALS)[number];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="card-lift group relative w-[360px] md:w-[420px] rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-7 shadow-ambient-sm transition-shadow hover:shadow-ambient">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(228,238,245,0.4),transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Quote className="relative mb-4 h-7 w-7 text-secondary-fixed transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
      <blockquote className="relative text-sm leading-relaxed text-on-surface-variant min-h-[120px]">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="relative mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {t.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{t.name}</p>
          <p className="text-xs text-on-surface-variant">
            {t.role} &middot; {t.clinic}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const top = TESTIMONIALS.map((t, i) => <TestimonialCard key={`t-${i}`} t={t} />);
  const bottomOrdered = [TESTIMONIALS[2], TESTIMONIALS[0], TESTIMONIALS[1]];
  const bottom = bottomOrdered.map((t, i) => <TestimonialCard key={`b-${i}`} t={t} />);

  return (
    <section className="section-atmosphere bg-surface-container-low py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
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
      </div>

      <DualMarquee top={top} bottom={bottom} className="mt-12" />
    </section>
  );
}
