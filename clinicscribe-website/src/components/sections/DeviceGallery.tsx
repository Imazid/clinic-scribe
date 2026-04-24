"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Mic, Check, ArrowRight, Upload, FileText, ShieldCheck } from "lucide-react";

const FRAME_STYLE = {
  background: "linear-gradient(160deg, #1F1A14 0%, #3B2E22 100%)",
};

const FRAMES = [
  {
    eyebrow: "Live in the room",
    title: "Capture the consult",
    subhead: "Encrypted on device. Live transcript with speaker separation.",
  },
  {
    eyebrow: "In your hands",
    title: "Review the note",
    subhead: "Provenance labelled. Confidence pills. Every line traceable.",
  },
  {
    eyebrow: "Into the record",
    title: "Export to your PMS",
    subhead: "FHIR R4 DocumentReference pushed to Genie. Record closed.",
  },
] as const;

// ─────────────────────────────────────────────────────────────
// Frame visuals
// ─────────────────────────────────────────────────────────────

function CaptureFrame() {
  return (
    <div className="p-8 text-on-primary">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0">
          <span className="absolute inset-0 rounded-full bg-secondary animate-[mira-pulse_1.8s_ease-out_infinite]" />
          <span
            className="absolute inset-0 rounded-full border border-secondary/60 animate-[pulse-ring_2.2s_ease-out_infinite]"
            style={{ animationDelay: "0.6s" }}
          />
          <span className="absolute inset-[10px] rounded-full bg-secondary flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.1em] uppercase font-bold text-on-primary/50">
            Listening · encrypted on device
          </span>
          <span className="text-xl font-mono font-bold tracking-tight">00:02:18</span>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-[3px] h-14">
        {Array.from({ length: 72 }).map((_, i) => (
          <motion.span
            key={i}
            className="rounded-sm"
            initial={{ height: 6 }}
            animate={{
              height: [6, 10 + (Math.sin(i * 0.5) + 1) * 18 + (i % 7 === 0 ? 10 : 0), 6],
            }}
            transition={{
              duration: 1.1 + (i % 3) * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 5) * 0.08,
            }}
            style={{ width: 3, background: i % 4 === 0 ? "#6FA1C2" : "rgba(252,249,244,0.35)" }}
          />
        ))}
      </div>
      <div className="mt-6 text-sm leading-relaxed text-on-primary/85">
        <div className="text-secondary-fixed-dim text-[10px] tracking-wider uppercase font-bold">
          Patient
        </div>
        Headaches started about two weeks ago, mostly in the morning, sometimes sensitive to light...
        <div className="mt-2.5 text-secondary-fixed-dim text-[10px] tracking-wider uppercase font-bold">
          Dr Sarah
        </div>
        Any nausea or visual disturbance?
      </div>
    </div>
  );
}

function ReviewFrame() {
  return (
    <div className="p-8 text-on-primary">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded-full bg-tertiary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">
          Draft · 94% confidence
        </span>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success-container">
          Provenance labelled
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-on-primary/60">
          <ShieldCheck className="h-3 w-3" />
          Clinician-reviewed
        </span>
      </div>

      <div className="mt-5 rounded-xl bg-white/5 p-5 text-sm leading-relaxed">
        <div>
          <strong className="text-on-primary">S:</strong>{" "}
          <span className="text-on-primary/85">
            2-week history of morning headaches, mild photophobia. No nausea or visual changes.
          </span>
        </div>
        <div className="mt-2">
          <strong className="text-on-primary">O:</strong>{" "}
          <span className="text-on-primary/85">
            BP 132/84 · Fundoscopy normal · No neuro deficit.
          </span>
        </div>
        <div className="mt-2">
          <strong className="text-on-primary">A:</strong>{" "}
          <span className="text-on-primary/85">
            Likely tension-type headache. No red flags.
          </span>
        </div>
        <div className="mt-2">
          <strong className="text-on-primary">P:</strong>{" "}
          <span className="text-on-primary/85">
            Trial paracetamol · sleep hygiene · review in 2 weeks.
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {[
          "SOAP structure verified",
          "No contradictions with prior notes",
          "Allergy flags reviewed",
        ].map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.2 }}
            className="flex items-center gap-2.5 text-[12px] text-on-primary/85"
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

function ExportFrame() {
  return (
    <div className="p-8 text-on-primary">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <FileText className="h-5 w-5 text-secondary-fixed-dim" />
          </span>
          <div>
            <div className="text-sm font-semibold">SOAP · Nguyen, M.</div>
            <div className="text-[11px] text-on-primary/60">Approved 12:04pm</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-tertiary">
          <ArrowRight className="h-4 w-4" />
          <Upload className="h-4 w-4" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] tracking-[0.1em] uppercase font-bold text-on-primary/50">
            Destination
          </span>
          <span className="text-sm font-semibold text-secondary-fixed-dim">Genie · AU</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white/5 p-5 font-mono text-[11.5px] leading-relaxed text-on-primary/85">
        <div className="text-tertiary mb-1">FHIR DocumentReference</div>
        <div>&nbsp;&nbsp;resourceType: <span className="text-secondary-fixed-dim">&quot;DocumentReference&quot;</span></div>
        <div>&nbsp;&nbsp;status: <span className="text-secondary-fixed-dim">&quot;current&quot;</span></div>
        <div>&nbsp;&nbsp;type: <span className="text-secondary-fixed-dim">{`{ coding: [SOAP] }`}</span></div>
        <div>&nbsp;&nbsp;author: <span className="text-secondary-fixed-dim">&quot;Dr Sarah · miraa&quot;</span></div>
        <div>&nbsp;&nbsp;subject: <span className="text-secondary-fixed-dim">&quot;Patient/12401&quot;</span></div>
        <div>&nbsp;&nbsp;content: <span className="text-secondary-fixed-dim">[Binary/soap-2026-04-24]</span></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-success/20 px-3.5 py-1.5 text-[11px] font-semibold text-success-container"
      >
        <Check className="h-3.5 w-3.5" />
        Pushed to Genie · record closed
      </motion.div>
    </div>
  );
}

const FRAME_RENDERERS = [CaptureFrame, ReviewFrame, ExportFrame];

// ─────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────

export function DeviceGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
    if (next !== active) setActive(next);
  });

  const ActiveFrame = FRAME_RENDERERS[active];
  const frame = FRAMES[active];

  return (
    <section
      ref={ref}
      className="relative bg-surface-container-low"
      style={{ height: "340vh" }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="section-atmosphere absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Left: synced copy */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="label-text text-secondary">{frame.eyebrow}</span>
                  <h2 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.05]">
                    {frame.title}
                  </h2>
                  <p className="mt-5 max-w-md text-lg text-on-surface-variant leading-relaxed">
                    {frame.subhead}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center gap-2">
                {FRAMES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? "w-8 bg-secondary" : "w-1.5 bg-outline-variant"
                    }`}
                  />
                ))}
                <span className="ml-3 text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  {active + 1} / {FRAMES.length}
                </span>
              </div>
            </div>

            {/* Right: device frame */}
            <div className="relative">
              <div className="absolute -inset-10 rounded-[40px] bg-gradient-to-br from-secondary/8 via-transparent to-tertiary/8 blur-3xl" aria-hidden="true" />
              <div
                className="relative rounded-[28px] overflow-hidden shadow-ambient-lg min-h-[520px]"
                style={FRAME_STYLE}
              >
                {/* Browser chrome dots */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="ml-3 text-[10px] tracking-[0.14em] uppercase font-bold text-on-primary/40">
                    miraa · workspace
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ActiveFrame />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
