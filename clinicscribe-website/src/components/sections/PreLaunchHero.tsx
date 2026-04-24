"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Mic } from "lucide-react";
import { PRELAUNCH } from "@/lib/constants";
import { LiveCount } from "@/components/ui/LiveCount";
import { GradientMesh } from "@/components/ui/GradientMesh";
import { Parallax } from "@/components/ui/Parallax";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextReveal } from "@/components/ui/TextReveal";
import { CursorGlow } from "@/components/ui/CursorGlow";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const avatarInitials = ["DS", "JK", "AM", "RL"];
const avatarColors = [
  "bg-secondary",
  "bg-primary-container",
  "bg-secondary-fixed-dim",
  "bg-primary",
];

/* Waveform bars for the capture dock */
function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px] h-14">
      {Array.from({ length: 64 }).map((_, i) => (
        <span
          key={i}
          className="rounded-sm"
          style={{
            width: 3,
            background: i % 4 === 0 ? "#6FA1C2" : "rgba(252,249,244,0.35)",
            height: 8 + (Math.sin(i * 0.5) + 1) * 18 + (i % 7 === 0 ? 10 : 0),
          }}
        />
      ))}
    </div>
  );
}

export function PreLaunchHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-surface flex items-center pt-24 pb-16">
      {/* Background */}
      <GradientMesh />
      <CursorGlow color="rgba(46,154,147,0.18)" size={680} />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col"
        >
          {/* Pilot badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-1.5 text-xs font-semibold tracking-wide text-[#1E3D55]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
              </span>
              Now in pilot with Australian GPs
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={item}>
            <TextReveal
              as="h1"
              className="mt-8 font-bold tracking-[-0.035em] text-primary leading-[1.02] max-w-[980px]"
              style={{ fontSize: "clamp(48px, 7vw, 84px)" }}
              stagger={0.05}
              segments={[
                { text: "The quiet part " },
                {
                  text: "of care",
                  className: "font-display italic font-normal",
                  style: {
                    background: "linear-gradient(92deg, #2F5A7A 20%, #6FA1C2 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  },
                },
                { text: ", finally handled." },
              ]}
            />
          </motion.div>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="mt-7 text-xl text-on-surface-variant leading-relaxed max-w-[620px]"
            style={{ textWrap: "pretty" }}
          >
            Miraa listens to your consultation, writes the note you were going to write anyway, and leaves you with your patient — and your evenings.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex gap-3 flex-wrap">
            <MagneticButton>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-[15px] hover:-translate-y-px hover:shadow-ambient-sm transition-all"
              >
                Join the waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>
            <Link
              href="/product"
              className="px-6 py-3.5 rounded-full bg-transparent text-primary font-semibold text-[15px] border border-outline-variant hover:bg-surface-container-high transition-colors"
            >
              See how it works
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={item}
            className="mt-7 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {avatarInitials.map((initials, i) => (
                <div
                  key={initials}
                  className={`w-8 h-8 rounded-full ${avatarColors[i]} flex items-center justify-center text-[10px] font-bold text-on-primary ring-2 ring-surface`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-on-surface-variant">
              Join{" "}
              <span className="font-semibold text-primary">
                <LiveCount fallback={PRELAUNCH.socialProofCount} />
              </span>{" "}
              {PRELAUNCH.socialProofText}
            </p>
          </motion.div>

          {/* Capture dock mockup */}
          <Parallax speed={0.2} className="mt-[72px] relative">
          <CursorGlow color="rgba(111,161,194,0.35)" size={560} />
          <motion.div
            variants={item}
            className="relative rounded-[28px] overflow-hidden shadow-ambient-lg"
            style={{ background: "linear-gradient(160deg, #1F1A14 0%, #3B2E22 100%)" }}
          >
            <div className="p-9 md:px-10">
              {/* Top bar: pulse + timer + waveform */}
              <div className="flex items-center gap-5 text-on-primary">
                {/* Pulsing mic */}
                <div className="relative w-14 h-14 shrink-0">
                  <span className="absolute inset-0 rounded-full bg-secondary animate-[mira-pulse_1.8s_ease-out_infinite]" />
                  <span
                    className="absolute inset-0 rounded-full border border-secondary/60 animate-[pulse-ring_2.2s_ease-out_infinite]"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <span className="absolute inset-[10px] rounded-full bg-secondary flex items-center justify-center">
                    <Mic className="w-[22px] h-[22px] text-white" />
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs tracking-[0.08em] uppercase text-[rgba(252,249,244,0.5)] font-bold">
                    Listening · encrypted on device
                  </span>
                  <span className="text-[28px] font-mono font-bold tracking-tight">
                    00:03:47
                  </span>
                </div>
                <div className="ml-auto hidden md:flex">
                  <WaveformBars />
                </div>
              </div>

              {/* Transcript + draft note */}
              <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6 text-[rgba(252,249,244,0.88)]">
                <div>
                  <div className="text-[10.5px] tracking-[0.1em] uppercase text-[rgba(252,249,244,0.45)] font-bold mb-2.5">
                    Live transcript
                  </div>
                  <div className="text-sm leading-relaxed">
                    <div className="text-secondary-fixed-dim font-semibold text-[11px] tracking-wide">PATIENT</div>
                    2-week history of morning headaches, mild photophobia...
                    <div className="text-secondary-fixed-dim font-semibold text-[11px] tracking-wide mt-2.5">DR SARAH</div>
                    Any nausea or visual changes?
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] tracking-[0.1em] uppercase text-[rgba(252,249,244,0.45)] font-bold mb-2.5">
                    Draft note · 94% confidence
                  </div>
                  <div className="text-sm leading-relaxed">
                    <strong>S:</strong> 2-week history of morning headaches.
                    <br />
                    <strong>A:</strong> Likely tension-type headache. No red flags.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </Parallax>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-16 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6 text-outline" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
