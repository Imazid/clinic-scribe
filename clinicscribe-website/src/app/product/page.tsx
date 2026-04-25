"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Mic,
  FileText,
  Upload,
  CheckCircle,
  ArrowRight,
  ListChecks,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  Receipt,
  MessageSquareHeart,
  Lock,
  Activity,
  AlertTriangle,
  Send,
} from "lucide-react";
import Link from "next/link";
import { WORKFLOW_STEPS, FEATURES } from "@/lib/constants";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextReveal } from "@/components/ui/TextReveal";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Mic,
  FileText,
  Upload,
  CheckCircle,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Receipt,
  MessageSquareHeart,
  Lock,
};

const FRAME_STYLE = {
  background: "linear-gradient(160deg, #1F1A14 0%, #3B2E22 100%)",
};

// ============================================================
// STEP VISUALS — one per workflow step, rendered inside the dark frame
// ============================================================

function PrepareVisual() {
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(252,249,244,0.45)] font-bold">
            Pre-visit brief
          </p>
          <p className="mt-1 font-display italic text-lg text-secondary-fixed-dim">
            Mr Patel · 09:40 review
          </p>
        </div>
        <span className="text-[10px] tracking-wider uppercase font-bold text-secondary-fixed-dim bg-secondary/15 rounded-full px-2.5 py-1">
          Ready
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(252,249,244,0.45)] font-bold">
          Today&apos;s agenda
        </p>
        {[
          "Review abdominal pain since antibiotic start",
          "Repeat CRP and consider further imaging",
          "Confirm ultrasound booking and follow-up",
        ].map((line) => (
          <div
            key={line}
            className="flex items-start gap-2.5 text-sm text-[rgba(252,249,244,0.85)]"
          >
            <CheckCircle className="w-3.5 h-3.5 text-secondary-fixed-dim mt-0.5 shrink-0" />
            <span>{line}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        {[
          { label: "Ramipril", detail: "Up 2 wks ago" },
          { label: "CRP", detail: "Mildly raised" },
          { label: "USS", detail: "Pending" },
        ].map((chip) => (
          <div
            key={chip.label}
            className="rounded-xl bg-[rgba(252,249,244,0.06)] border border-[rgba(252,249,244,0.1)] px-3 py-2.5"
          >
            <p className="text-[10px] tracking-wider uppercase text-secondary-fixed-dim font-bold">
              {chip.label}
            </p>
            <p className="text-xs text-[rgba(252,249,244,0.7)] mt-1">
              {chip.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CaptureVisual() {
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 shrink-0">
          <span className="absolute inset-0 rounded-full bg-secondary animate-[mira-pulse_1.8s_ease-out_infinite]" />
          <span className="absolute inset-[8px] rounded-full bg-secondary flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </span>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(252,249,244,0.45)] font-bold">
            Listening · encrypted
          </p>
          <p className="text-2xl font-mono font-bold tracking-tight">
            00:03:47
          </p>
        </div>
        <div className="ml-auto flex gap-[3px] items-end h-8">
          {[16, 24, 12, 28, 18, 22, 14, 26].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-secondary-fixed-dim"
              style={{ height: `${h}px`, opacity: 0.55 + (i % 3) * 0.15 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div>
          <p className="text-secondary-fixed-dim font-bold text-[10px] tracking-wider uppercase">
            Patient
          </p>
          <p className="text-[rgba(252,249,244,0.85)] mt-1 leading-relaxed">
            Pain after meals is less sharp than last week. No fever.
          </p>
        </div>
        <div>
          <p className="text-secondary-fixed-dim font-bold text-[10px] tracking-wider uppercase">
            Dr Sarah
          </p>
          <p className="text-[rgba(252,249,244,0.85)] mt-1 leading-relaxed">
            Any vomiting or new bowel changes since the antibiotic?
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-[rgba(252,249,244,0.06)] border border-[rgba(252,249,244,0.1)] p-3.5">
        <p className="text-[10px] tracking-[0.12em] uppercase text-secondary-fixed-dim font-bold mb-2">
          Detected actions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {["Repeat CRP", "Confirm USS booking", "Tolerance check"].map((a) => (
            <span
              key={a}
              className="text-[11px] text-[rgba(252,249,244,0.85)] bg-[rgba(252,249,244,0.08)] rounded-full px-2.5 py-1"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function VerifyVisual() {
  const lines = [
    {
      tag: "S",
      label: "Subjective",
      text: "2-week post-prandial abdominal pain, improving since antibiotic.",
      cite: "transcript 09:42",
      tone: "ok",
    },
    {
      tag: "O",
      label: "Objective",
      text: "Soft abdomen, mild tenderness in RUQ. Afebrile.",
      cite: "exam imported",
      tone: "ok",
    },
    {
      tag: "A",
      label: "Assessment",
      text: "Likely resolving cholecystitis. Imaging still required.",
      cite: "needs review",
      tone: "warn",
    },
  ];

  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(252,249,244,0.45)] font-bold">
          Note review · 94% confidence
        </p>
        <span className="text-[10px] tracking-wider uppercase font-bold text-secondary-fixed-dim bg-secondary/15 rounded-full px-2.5 py-1">
          1 to verify
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {lines.map((l) => (
          <div
            key={l.tag}
            className="rounded-xl border border-[rgba(252,249,244,0.1)] bg-[rgba(252,249,244,0.04)] p-3.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-secondary/20 text-secondary-fixed-dim flex items-center justify-center text-xs font-bold">
                {l.tag}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-secondary-fixed-dim font-bold">
                {l.label}
              </span>
              <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold">
                {l.tone === "warn" ? (
                  <AlertTriangle className="w-3 h-3 text-amber-300" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-secondary-fixed-dim" />
                )}
                <span
                  className={
                    l.tone === "warn"
                      ? "text-amber-300"
                      : "text-[rgba(252,249,244,0.55)]"
                  }
                >
                  {l.cite}
                </span>
              </span>
            </div>
            <p className="mt-2 text-sm text-[rgba(252,249,244,0.88)] leading-relaxed">
              {l.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CloseVisual() {
  const tasks = [
    { title: "Order repeat CRP and FBC", due: "this week", done: false },
    { title: "Book abdominal ultrasound", due: "by Friday", done: true },
    { title: "Patient summary and instructions", due: "send today", done: false },
    { title: "Schedule 2-week review", due: "next slot", done: false },
  ];

  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(252,249,244,0.45)] font-bold">
          Plan items · close the loop
        </p>
        <span className="text-[10px] tracking-wider uppercase font-bold text-secondary-fixed-dim">
          1 of 4 done
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {tasks.map((t) => (
          <div
            key={t.title}
            className="flex items-center gap-3 rounded-xl border border-[rgba(252,249,244,0.08)] bg-[rgba(252,249,244,0.04)] px-3.5 py-3"
          >
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                t.done
                  ? "bg-secondary text-white"
                  : "border border-[rgba(252,249,244,0.25)]"
              }`}
            >
              {t.done && <CheckCircle className="w-3.5 h-3.5" />}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  t.done
                    ? "text-[rgba(252,249,244,0.5)] line-through"
                    : "text-[rgba(252,249,244,0.9)]"
                }`}
              >
                {t.title}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-secondary-fixed-dim shrink-0">
              {t.due}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportVisual() {
  const destinations = [
    { name: "Best Practice", detail: "Clinical note", status: "Sent" },
    { name: "Genie Solutions", detail: "Referral letter", status: "Queued" },
    { name: "Patient portal", detail: "After-visit summary", status: "Draft" },
  ];

  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(252,249,244,0.45)] font-bold">
          Approved exports · FHIR-ready
        </p>
        <Send className="w-4 h-4 text-secondary-fixed-dim" />
      </div>

      <div className="mt-5 space-y-2.5">
        {destinations.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-3 rounded-xl bg-[rgba(252,249,244,0.05)] border border-[rgba(252,249,244,0.1)] px-3.5 py-3"
          >
            <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary-fixed-dim font-bold text-xs shrink-0">
              {d.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[rgba(252,249,244,0.9)]">
                {d.name}
              </p>
              <p className="text-xs text-[rgba(252,249,244,0.55)]">
                {d.detail}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-secondary-fixed-dim bg-secondary/15 rounded-full px-2.5 py-1 shrink-0">
              {d.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-[rgba(252,249,244,0.08)] bg-[rgba(252,249,244,0.03)] p-3.5">
        <p className="text-[10px] tracking-[0.12em] uppercase text-secondary-fixed-dim font-bold">
          Audit trail
        </p>
        <p className="text-xs text-[rgba(252,249,244,0.7)] mt-1.5 leading-relaxed">
          Approved by Dr Sarah · 09:48 · 2 edits before send. Original transcript retained.
        </p>
      </div>
    </div>
  );
}

function TrackVisual() {
  const items = [
    { title: "USS result expected", when: "Fri", state: "watching" },
    { title: "CRP result", when: "Wed", state: "watching" },
    { title: "Patient response to summary", when: "—", state: "open" },
  ];
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(252,249,244,0.45)] font-bold">
          Open follow-ups · this patient
        </p>
        <Activity className="w-4 h-4 text-secondary-fixed-dim" />
      </div>

      <div className="mt-5 space-y-2.5">
        {items.map((i) => (
          <div
            key={i.title}
            className="flex items-center gap-3 rounded-xl bg-[rgba(252,249,244,0.05)] border border-[rgba(252,249,244,0.1)] px-3.5 py-3"
          >
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[rgba(252,249,244,0.9)]">{i.title}</p>
              <p className="text-[10px] uppercase tracking-wider text-[rgba(252,249,244,0.5)] font-bold mt-0.5">
                {i.state}
              </p>
            </div>
            <span className="text-xs font-mono text-secondary-fixed-dim shrink-0">
              {i.when}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {[
          { label: "Open", value: "3" },
          { label: "Closed wk", value: "12" },
          { label: "Avg close", value: "2.1d" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-[rgba(252,249,244,0.05)] border border-[rgba(252,249,244,0.08)] px-3 py-2.5 text-center"
          >
            <p className="text-lg font-display font-semibold text-secondary-fixed-dim">
              {s.value}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[rgba(252,249,244,0.55)] font-bold mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const STEP_VISUALS = [
  PrepareVisual,
  CaptureVisual,
  VerifyVisual,
  CloseVisual,
  ExportVisual,
  TrackVisual,
];

// ============================================================
// STICKY-SCROLL STEP — detects when this step crosses viewport center
// ============================================================

function StepBlock({
  index,
  step,
  onActive,
}: {
  index: number;
  step: (typeof WORKFLOW_STEPS)[number];
  onActive: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    margin: "-50% 0px -50% 0px",
    once: false,
  });
  const Icon = iconMap[step.icon] ?? CheckCircle;

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <div
      ref={ref}
      className="min-h-[70vh] flex flex-col justify-center py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-wider text-secondary font-bold">
            0{step.step}
          </span>
          <span className="h-px flex-1 bg-outline-variant" />
          <span className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-secondary" />
          </span>
        </div>

        <h3 className="mt-5 text-3xl md:text-4xl font-bold text-primary tracking-tight">
          {step.title}
          <span className="accent-serif"> the visit</span>
        </h3>
        <p className="mt-4 text-base md:text-lg text-on-surface-variant leading-relaxed max-w-md">
          {step.description}
        </p>

        {/* Mobile inline visual */}
        <div className="lg:hidden mt-6 rounded-[24px] overflow-hidden shadow-ambient-lg" style={FRAME_STYLE}>
          {(() => {
            const Visual = STEP_VISUALS[index];
            return <Visual />;
          })()}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function ProductPage() {
  const [active, setActive] = useState(0);
  const ActiveVisual = STEP_VISUALS[active];

  return (
    <>
      {/* Hero */}
      <section className="section-atmosphere relative overflow-hidden bg-surface-container-low pt-32 pb-20">
        <FloatingElements variant="hero" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="label-text text-secondary"
          >
            Product
          </motion.p>
          <TextReveal
            as="h1"
            className="mt-4 text-4xl md:text-6xl font-bold text-primary tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
            stagger={0.05}
            segments={[
              { text: "From the room" },
              { text: " to the record", className: "accent-serif" },
            ]}
          />
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
            style={{ textWrap: "pretty" }}
          >
            Six steps that take a consult from the briefing before it starts to the follow-up after it ends — written by AI, signed off by you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex justify-center gap-3 flex-wrap"
          >
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
              href="#workflow"
              className="px-6 py-3.5 rounded-full bg-transparent text-primary font-semibold text-[15px] border border-outline-variant hover:bg-surface-container-high transition-colors"
            >
              See how it works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Sticky-scroll workflow */}
      <section
        id="workflow"
        className="relative bg-surface py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-16"
          >
            <p className="label-text text-secondary">The workflow</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold text-primary tracking-tight">
              Six steps,
              <span className="accent-serif"> one consult</span>
            </h2>
            <p className="mt-5 text-on-surface-variant text-lg leading-relaxed">
              Scroll through the workflow. The visual on the right updates as each step enters view.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16">
            {/* Left: scrolling steps */}
            <div className="lg:py-16">
              {WORKFLOW_STEPS.map((step, i) => (
                <StepBlock
                  key={step.step}
                  index={i}
                  step={step}
                  onActive={setActive}
                />
              ))}
            </div>

            {/* Right: sticky frame (desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <div className="relative">
                  {/* Step indicator */}
                  <div className="absolute -top-10 left-0 right-0 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] font-bold">
                    <span className="text-secondary">
                      Step {WORKFLOW_STEPS[active].step} of {WORKFLOW_STEPS.length}
                    </span>
                    <span className="text-on-surface-variant">
                      {WORKFLOW_STEPS[active].title}
                    </span>
                  </div>

                  {/* Frame */}
                  <div
                    className="rounded-[28px] overflow-hidden shadow-ambient-lg min-h-[520px]"
                    style={FRAME_STYLE}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <ActiveVisual />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Progress dots */}
                  <div className="mt-5 flex items-center justify-center gap-1.5">
                    {WORKFLOW_STEPS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === active
                            ? "w-8 bg-secondary"
                            : "w-2 bg-outline-variant"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities grid */}
      <section className="section-atmosphere bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-14"
          >
            <p className="label-text text-secondary">Capabilities</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold text-primary tracking-tight">
              What&apos;s
              <span className="accent-serif"> in the box</span>
            </h2>
            <p className="mt-5 text-on-surface-variant text-lg leading-relaxed">
              The features that sit underneath the workflow — the ones you&apos;ll touch every consult.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = iconMap[feature.icon] ?? CheckCircle;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="card-lift group bg-surface-container-lowest rounded-2xl border border-outline-variant/25 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-[10px] tracking-wider uppercase font-bold text-outline">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-atmosphere py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
              Ready to
              <span className="accent-serif"> finish the consult?</span>
            </h2>
            <p className="mt-5 text-on-surface-variant text-lg leading-relaxed">
              Join the waitlist for first access when Miraa launches and the 14-day free trial opens.
            </p>
            <div className="mt-8 flex justify-center">
              <MagneticButton>
                <Link
                  href="/waitlist"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-[15px] hover:-translate-y-px hover:shadow-ambient-sm transition-all"
                >
                  Join the waitlist
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
