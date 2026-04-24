"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ClipboardList,
  Mic,
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle,
  ListChecks,
  Check,
  Circle,
  Bell,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  ClipboardList,
  Mic,
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle,
  ListChecks,
};

const FRAME_STYLE = {
  background: "linear-gradient(160deg, #1F1A14 0%, #3B2E22 100%)",
};

// ─────────────────────────────────────────────────────────────
// Ambient UI fragments — one per step
// ─────────────────────────────────────────────────────────────

function PrepareVisual() {
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-secondary-fixed/90 flex items-center justify-center text-[13px] font-bold text-[#1E3D55]">
          DS
        </div>
        <div>
          <div className="text-sm font-semibold">Mary Nguyen · 62 F</div>
          <div className="text-[11px] text-on-primary/60">Next visit · 10:30am</div>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-tertiary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
          Ready
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {[
          { label: "Active problems", value: "HTN · T2DM · OA knees" },
          { label: "Recent meds", value: "Metformin, Ramipril" },
          { label: "Last labs", value: "HbA1c 7.1 · eGFR 74" },
          { label: "Follow-ups", value: "BP log review · foot check" },
        ].map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.35 }}
            className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-[12.5px]"
          >
            <span className="text-on-primary/50 tracking-wide uppercase text-[10px] font-bold">
              {row.label}
            </span>
            <span className="text-on-primary/90 font-medium">{row.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CaptureVisual() {
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center gap-4">
        <div className="relative h-11 w-11 shrink-0">
          <span className="absolute inset-0 rounded-full bg-secondary animate-[mira-pulse_1.8s_ease-out_infinite]" />
          <span
            className="absolute inset-0 rounded-full border border-secondary/60 animate-[pulse-ring_2.2s_ease-out_infinite]"
            style={{ animationDelay: "0.6s" }}
          />
          <span className="absolute inset-[8px] rounded-full bg-secondary flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.1em] uppercase font-bold text-on-primary/50">
            Listening
          </span>
          <span className="text-xl font-mono font-bold tracking-tight">00:01:12</span>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-[3px] h-11">
        {Array.from({ length: 56 }).map((_, i) => (
          <motion.span
            key={i}
            className="rounded-sm"
            initial={{ height: 6 }}
            animate={{ height: [6, 8 + (Math.sin(i * 0.55) + 1) * 14 + (i % 5 === 0 ? 8 : 0), 6] }}
            transition={{
              duration: 1.1 + (i % 3) * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 6) * 0.08,
            }}
            style={{
              width: 3,
              background: i % 4 === 0 ? "#6FA1C2" : "rgba(252,249,244,0.35)",
            }}
          />
        ))}
      </div>
      <div className="mt-6 text-[12.5px] leading-relaxed text-on-primary/85">
        <div className="text-secondary-fixed-dim font-semibold text-[10px] tracking-wider uppercase">
          Patient
        </div>
        2-week history of morning headaches, mild photophobia...
        <div className="mt-2 text-secondary-fixed-dim font-semibold text-[10px] tracking-wider uppercase">
          Clinician
        </div>
        Any nausea or visual changes?
      </div>
    </div>
  );
}

function VerifyVisual() {
  const checks = [
    "SOAP structure present",
    "No unsupported findings",
    "No contradictions with prior",
    "Allergy flags reviewed",
  ];
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-tertiary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">
          Draft · 94% confidence
        </span>
        <span className="ml-auto text-[11px] text-on-primary/50">Provenance labelled</span>
      </div>
      <div className="mt-5 rounded-xl bg-white/5 p-4 text-[12.5px] leading-relaxed">
        <div className="text-on-primary/90">
          <strong>S:</strong> 2-week history of morning headaches.
        </div>
        <div className="text-on-primary/90 mt-1">
          <strong>O:</strong> BP 132/84. Fundoscopy normal.
        </div>
        <div className="text-on-primary/90 mt-1">
          <strong>A:</strong> Likely tension-type headache. No red flags.
        </div>
        <div className="text-on-primary/90 mt-1">
          <strong>P:</strong> Trial paracetamol · sleep hygiene · review 2w.
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {checks.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.2 }}
            className="flex items-center gap-2.5 text-[12px] text-on-primary/80"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * i + 0.3, type: "spring", stiffness: 320, damping: 20 }}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-success/80"
            >
              <Check className="h-2.5 w-2.5 text-white" />
            </motion.span>
            {c}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CloseVisual() {
  const tasks = [
    { text: "Order FBE + LFT", done: true },
    { text: "Book 2-week review", done: true },
    { text: "Generate patient summary", done: true },
    { text: "Referral to cardiology", done: false },
  ];
  return (
    <div className="p-7 text-on-primary">
      <div className="text-[10px] tracking-[0.1em] uppercase font-bold text-on-primary/50">
        Approved plan
      </div>
      <div className="mt-3 space-y-2.5">
        {tasks.map((t, i) => (
          <motion.div
            key={t.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-[12.5px]"
          >
            <motion.span
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08 * i + 0.15, type: "spring", stiffness: 300 }}
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                t.done ? "bg-success/80" : "bg-white/10 border border-white/20"
              }`}
            >
              {t.done ? <Check className="h-3 w-3 text-white" /> : <Circle className="h-2 w-2 text-on-primary/40" />}
            </motion.span>
            <span className={t.done ? "text-on-primary/90" : "text-on-primary/60"}>
              {t.text}
            </span>
            {t.done && (
              <span className="ml-auto text-[10px] text-tertiary/80 font-semibold uppercase tracking-wider">
                Done
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ExportVisual() {
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.1em] uppercase font-bold text-on-primary/50">
            Approved note
          </span>
          <span className="text-sm font-semibold">SOAP · Nguyen, M.</span>
        </div>
        <motion.div
          initial={{ x: -6, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 text-tertiary"
        >
          <ArrowRight className="h-4 w-4" />
          <Upload className="h-4 w-4" />
        </motion.div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] tracking-[0.1em] uppercase font-bold text-on-primary/50">
            Destination
          </span>
          <span className="text-sm font-semibold text-secondary-fixed-dim">Genie · AU</span>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-white/5 p-4 font-mono text-[11px] leading-relaxed text-on-primary/80">
        <div className="text-tertiary">FHIR DocumentReference</div>
        <div>&nbsp;&nbsp;status: <span className="text-secondary-fixed-dim">&quot;current&quot;</span></div>
        <div>&nbsp;&nbsp;type: <span className="text-secondary-fixed-dim">&quot;SOAP&quot;</span></div>
        <div>&nbsp;&nbsp;author: <span className="text-secondary-fixed-dim">Dr Sarah · miraa</span></div>
        <div>&nbsp;&nbsp;subject: <span className="text-secondary-fixed-dim">Patient/12401</span></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/20 px-3 py-1.5 text-[11px] font-semibold text-success-container"
      >
        <Check className="h-3 w-3" />
        Pushed to record · 12:04pm
      </motion.div>
    </div>
  );
}

function TrackVisual() {
  const items = [
    { text: "BP log review · Mary N.", due: "In 3 days", overdue: false },
    { text: "Referral response · Cardiology", due: "7 days pending", overdue: false },
    { text: "Repeat HbA1c · James L.", due: "Overdue 2 days", overdue: true },
  ];
  return (
    <div className="p-7 text-on-primary">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-tertiary" />
        <span className="text-[10px] tracking-[0.1em] uppercase font-bold text-on-primary/50">
          Open loops
        </span>
        <span className="ml-auto text-[11px] text-on-primary/50">3 active</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {items.map((row, i) => (
          <motion.div
            key={row.text}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-[12.5px]"
          >
            <span className="text-on-primary/90">{row.text}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                row.overdue ? "text-error-container" : "text-tertiary"
              }`}
            >
              {row.due}
            </span>
          </motion.div>
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

// ─────────────────────────────────────────────────────────────
// Sticky-scroll step block (desktop)
// ─────────────────────────────────────────────────────────────

function StepBlock({
  step,
  index,
  onActive,
}: {
  step: (typeof WORKFLOW_STEPS)[number];
  index: number;
  onActive: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-50% 0px -50% 0px", once: false });
  const Icon = iconMap[step.icon] ?? CheckCircle;

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <div ref={ref} className="min-h-[70vh] flex flex-col justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.14em] text-secondary font-bold">
            0{step.step}
          </span>
          <span className="h-px flex-1 bg-outline-variant" />
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10">
            <Icon className="h-4 w-4 text-secondary" />
          </span>
        </div>
        <h3 className="mt-5 text-3xl md:text-4xl font-bold text-primary tracking-tight">
          {step.title}
        </h3>
        <p className="mt-4 text-base md:text-lg text-on-surface-variant leading-relaxed max-w-md">
          {step.description}
        </p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────

export function WorkflowDiagram() {
  const [active, setActive] = useState(0);
  const ActiveVisual = STEP_VISUALS[active];

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
          <span className="label-text text-secondary">Workflow</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary md:text-4xl">
            From visit prep to closeout in one workflow
          </h2>
          <p className="mt-4 text-on-surface-variant leading-relaxed">
            Six steps, synchronised. Scroll through the workflow — the panel on the right updates as each step enters view.
          </p>
        </motion.div>

        {/* Desktop: sticky-scroll */}
        <div className="mt-16 hidden lg:grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-16">
          <div className="lg:py-12">
            {WORKFLOW_STEPS.map((step, i) => (
              <StepBlock key={step.step} step={step} index={i} onActive={setActive} />
            ))}
          </div>
          <div>
            <div className="sticky top-28">
              <div className="relative">
                <div className="absolute -top-10 left-0 right-0 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] font-bold">
                  <span className="text-secondary">
                    Step {WORKFLOW_STEPS[active].step} of {WORKFLOW_STEPS.length}
                  </span>
                  <span className="text-on-surface-variant">
                    {WORKFLOW_STEPS[active].title}
                  </span>
                </div>
                <div
                  className="rounded-[28px] overflow-hidden shadow-ambient-lg min-h-[480px]"
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
                <div className="mt-5 flex items-center justify-center gap-1.5">
                  {WORKFLOW_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === active ? "w-6 bg-secondary" : "w-1.5 bg-outline-variant"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: vertical flow */}
        <div className="mt-14 space-y-0 lg:hidden">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = iconMap[step.icon] || CheckCircle;
            const isLast = i === WORKFLOW_STEPS.length - 1;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative flex gap-5"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-secondary shadow-ambient-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLast && (
                    <div className="my-1 h-full w-px border-l-2 border-dashed border-outline-variant" />
                  )}
                </div>
                <div className="pb-8">
                  <span className="label-text text-on-surface-variant">
                    Step {step.step}
                  </span>
                  <h3 className="mt-1 font-semibold text-primary">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
