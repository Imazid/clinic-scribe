"use client";

import { motion } from "framer-motion";
import {
  Mic,
  FileText,
  UserCheck,
  Upload,
  CheckCircle,
  FileAudio,
  ArrowRight,
  Activity,
  Send,
  Receipt,
  ListChecks,
  ShieldCheck,
  Eye,
  PenLine,
  ThumbsUp,
  AlertTriangle,
  Clock,
  Layers,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { WORKFLOW_STEPS, FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Mic,
  FileAudio,
  FileText,
  UserCheck,
  Upload,
  CheckCircle,
  Send,
  Receipt,
  ListChecks,
  ShieldCheck,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const captureHighlights = [
  {
    icon: Mic,
    title: "Ambient Listening",
    desc: "Real-time capture during consultations with one tap.",
  },
  {
    icon: Upload,
    title: "Upload Recordings",
    desc: "Bring telehealth sessions and dictation audio into the same workflow.",
  },
  {
    icon: Activity,
    title: "Noise & Interruptions",
    desc: "Recover from interruptions and keep the transcript usable when the room gets messy.",
  },
  {
    icon: FileText,
    title: "Structured Extraction",
    desc: "Pull symptoms, medications, and follow-up actions into a usable clinical workspace while the visit is still happening.",
  },
];

const prepareHighlights = [
  {
    icon: ClipboardList,
    title: "Pre-Visit Briefing",
    desc: "Walk into the consult with the last visit, active problems, medications, and unresolved items already summarised.",
  },
  {
    icon: Layers,
    title: "Longitudinal Context",
    desc: "See the patient story across prior visits instead of reconstructing it from scattered notes.",
  },
  {
    icon: AlertTriangle,
    title: "Result & Risk Watchlist",
    desc: "Surface abnormal results, pending imaging, and unresolved referrals before the room gets busy.",
  },
  {
    icon: Clock,
    title: "Clarify Today",
    desc: "Highlight the missing details and likely agenda items that should be closed during the consult.",
  },
];

const prepareAgenda = [
  "Review abdominal pain since antibiotic start",
  "Check repeat CRP and whether imaging is still required",
  "Confirm ultrasound booking and follow-up timing",
];

const prepareWatchlist = [
  { label: "Ramipril", detail: "Increased 2 weeks ago", tone: "bg-secondary/10 text-secondary" },
  { label: "CRP", detail: "Mildly elevated on last result", tone: "bg-amber-100 text-amber-700" },
  { label: "Ultrasound", detail: "Booking still pending", tone: "bg-primary/10 text-primary" },
];

const prepareClarifications = [
  "Any vomiting, fever, or bowel changes since last review?",
  "Has the patient tolerated the antibiotic without side effects?",
  "Does the current plan still need surgical escalation advice?",
];

const captureTranscriptFeed = [
  {
    speaker: "Clinician",
    time: "09:41",
    accent: "bg-secondary/10 text-secondary border-secondary/20",
    initials: "DR",
    copy: "Let's review the abdominal pain and the repeat CRP before we decide whether this needs imaging today.",
  },
  {
    speaker: "Patient",
    time: "09:42",
    accent: "bg-primary/10 text-primary border-primary/15",
    initials: "PT",
    copy: "It is still mostly after meals, but it is less sharp than last week and I have not had any fever.",
  },
  {
    speaker: "Clinician",
    time: "09:43",
    accent: "bg-secondary/10 text-secondary border-secondary/20",
    initials: "DR",
    copy: "Good. Any vomiting, new bowel changes, or issues after starting the antibiotic?",
  },
  {
    speaker: "Patient",
    time: "09:43",
    accent: "bg-primary/10 text-primary border-primary/15",
    initials: "PT",
    copy: "No vomiting. Appetite is better. I still need the ultrasound booking sorted out.",
  },
];

const captureDetectedActions = [
  "Repeat CRP and FBC this week",
  "Follow up abdominal ultrasound booking",
  "Clarify antibiotic tolerance before final plan",
];

const captureWorkspaceTabs = ["Transcript", "Extraction", "Actions"];

const captureInsights = [
  {
    label: "Symptoms",
    detail: "Post-prandial abdominal pain improving, no fever, appetite better than last review.",
  },
  {
    label: "Medication context",
    detail: "Antibiotic recently started. Tolerance still needs confirmation in the room.",
  },
  {
    label: "Clinical risk",
    detail: "Imaging still unresolved, but the symptom trend sounds reassuring.",
  },
  {
    label: "Likely note direction",
    detail: "Follow-up review with improving symptoms, repeat bloods pending, imaging decision still open.",
  },
];

const captureAgenda = [
  "Review response to antibiotics",
  "Decide if imaging is still required",
  "Confirm follow-up timing and escalation advice",
];

const captureSignals = [
  "Noise score stable",
  "Interruption recovery active",
  "Medication mentions highlighted",
];

export default function ProductPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-atmosphere overflow-hidden bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Product
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            How Miraa Works
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            From consult prep to approved outputs — a complete workflow
            designed around clinical responsibility.
          </motion.p>
        </div>
      </section>

      {/* Workflow Diagram */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="label-text text-secondary mb-3">End-to-End Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              Six Steps. Clinician in Control.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = iconMap[step.icon] || CheckCircle;
              return (
                <motion.div
                  key={step.step}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="card-lift group relative rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-on-primary" />
                    </div>
                    <div>
                      <span className="label-text text-outline">
                        Step {step.step}
                      </span>
                      <h3 className="text-lg font-bold text-primary">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {step.description}
                  </p>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      {(i + 1) % 3 !== 0 && (
                        <ArrowRight className="w-5 h-5 text-outline-variant" />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 1: Prepare */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="label-text text-secondary mb-3">Prepare</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Walk into the consult already briefed
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Miraa opens the visit with a pre-visit brief instead of a blank screen. The clinician sees what matters today before capture starts.
              </p>
              <ul className="space-y-4">
                {prepareHighlights.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {item.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-hidden rounded-[2rem] border border-outline-variant/35 bg-surface-container-lowest p-4 shadow-ambient lg:p-5"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-secondary-fixed/35 via-secondary-fixed/10 to-primary/5" />

              <div className="relative rounded-[1.5rem] border border-outline-variant/45 bg-surface p-4 lg:p-5">
                <div className="flex flex-col gap-4 border-b border-outline-variant/40 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Brief ready
                    </span>
                    <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
                      Follow-up review
                    </span>
                    <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
                      09:45 appointment
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-outline">
                        Prepare Workspace
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-primary md:text-2xl">
                        CKD follow-up with unresolved imaging and lab review
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
                        Last visit noted improving symptoms after treatment adjustment, but the ultrasound and repeat inflammatory markers are still open.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { label: "Briefed", value: "2m ago" },
                        { label: "Flags", value: "2" },
                        { label: "Actions", value: "3" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-outline-variant/35 bg-surface-container-low px-3 py-2 text-center"
                        >
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-outline">
                            {stat.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                  <div className="rounded-[1.35rem] border border-outline-variant/35 bg-surface-container-low p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          What matters today
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Pre-visit brief assembled from prior visits and pending work
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-secondary">
                        Ready
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                        Likely agenda
                      </p>
                      <div className="mt-3 space-y-2">
                        {prepareAgenda.map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5"
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
                            <p className="text-sm leading-relaxed text-on-surface-variant">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-surface-container-lowest p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-outline">
                          Last visit
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                          Pain improved after antibiotics. Repeat CRP requested. Ultrasound planned if symptoms persisted.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-surface-container-lowest p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-outline">
                          Open follow-up
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                          Imaging booking unresolved, bloods not yet reviewed, and safety-net advice needs confirmation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[1.35rem] border border-outline-variant/35 bg-surface-container-low p-4">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-secondary" />
                        <p className="text-sm font-semibold text-primary">
                          Watchlist
                        </p>
                      </div>
                      <div className="mt-3 space-y-2">
                        {prepareWatchlist.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3 py-2.5"
                          >
                            <div>
                              <p className="text-sm font-semibold text-primary">
                                {item.label}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                {item.detail}
                              </p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${item.tone}`}>
                              Watch
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-outline-variant/35 bg-primary/[0.03] p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-secondary" />
                        <p className="text-sm font-semibold text-primary">
                          Clarify in the room
                        </p>
                      </div>
                      <div className="mt-3 space-y-2">
                        {prepareClarifications.map((item) => (
                          <div
                            key={item}
                            className="rounded-xl bg-surface-container-lowest px-3 py-2.5 text-sm leading-relaxed text-on-surface-variant"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Live & Recorded */}
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="label-text text-secondary mb-3">Capture</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Live &amp; Recorded
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Start ambient listening during a consultation, or upload a
                previously recorded session. Miraa captures the
                conversation with medical-grade speech recognition.
              </p>
              <ul className="space-y-4">
                {captureHighlights.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {item.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,243,238,0.96))] p-3 shadow-[0_24px_80px_rgba(58,46,34,0.10)] lg:p-4"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-secondary-fixed/40 via-secondary-fixed/15 to-primary/5" />
              <div className="pointer-events-none absolute -top-12 right-[-10%] h-40 w-40 rounded-full bg-secondary-fixed/25 blur-3xl" />

              <div className="relative rounded-[1.7rem] border border-outline-variant/40 bg-surface p-4 lg:p-5">
                <div className="rounded-[1.25rem] border border-outline-variant/35 bg-surface-container-low px-4 py-3 shadow-ambient-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffb84d]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-secondary-fixed-dim" />
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-light" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-outline">
                          Capture Workspace
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Capture, extraction, and follow-up in one view
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-secondary">
                        Active consult
                      </span>
                      <span className="rounded-full bg-surface px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-outline ring-1 ring-outline-variant/40">
                        Auto-saving
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 border-b border-outline-variant/35 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      <span className="h-2 w-2 rounded-full bg-secondary animate-pulse-slow" />
                      Live capture
                    </span>
                    <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
                      GP follow-up consult
                    </span>
                    <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
                      Speaker separation on
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-outline">
                        Capture Workspace
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-primary md:text-2xl">
                        Review the consult while the transcript is still live
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
                        The capture view keeps the transcript, likely agenda, and emerging follow-up work in one place so the clinician stays oriented during the visit.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { label: "Elapsed", value: "12:34" },
                        { label: "Noise", value: "Low" },
                        { label: "Actions", value: "3" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-outline-variant/35 bg-surface-container-low px-3 py-2 text-center"
                        >
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-outline">
                            {stat.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                  <div className="rounded-[1.35rem] border border-outline-variant/35 bg-surface-container-low p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          Live transcript
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Medical vocabulary recognised in real time
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-secondary">
                        Syncing
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {captureWorkspaceTabs.map((tab, index) => (
                        <span
                          key={tab}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            index === 0
                              ? "bg-primary text-on-primary"
                              : "bg-surface text-on-surface-variant ring-1 ring-outline-variant/40"
                          }`}
                        >
                          {tab}
                        </span>
                      ))}
                    </div>

                    <div className="relative mt-4">
                      <div className="pointer-events-none absolute top-3 bottom-3 left-5 hidden w-px bg-outline-variant/45 sm:block" />

                      <div className="relative space-y-3 xl:max-h-[24rem] xl:overflow-y-auto xl:pr-1 no-scrollbar">
                        {captureTranscriptFeed.map((entry) => (
                          <div
                            key={`${entry.speaker}-${entry.time}-${entry.copy}`}
                            className="rounded-[1.4rem] border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-[0_10px_24px_rgba(58,46,34,0.04)]"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[0.65rem] font-bold ${entry.accent}`}
                              >
                                {entry.initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-outline">
                                    {entry.speaker}
                                  </span>
                                  <span className="text-xs text-outline">
                                    {entry.time}
                                  </span>
                                </div>
                                <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                                  {entry.copy}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {captureSignals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/40"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[1.35rem] border border-outline-variant/35 bg-surface-container-low p-4 shadow-ambient-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-secondary" />
                        <p className="text-sm font-semibold text-primary">
                          Extracted clinical context
                        </p>
                      </div>
                      <div className="mt-3 space-y-2">
                        {captureInsights.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl bg-surface-container-lowest px-3 py-3"
                          >
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-secondary">
                              {item.label}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                              {item.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-outline-variant/35 bg-[linear-gradient(180deg,rgba(47,90,122,0.04),rgba(255,255,255,0.55))] p-4 shadow-ambient-sm">
                      <div className="flex items-center gap-2">
                        <FileAudio className="h-4 w-4 text-secondary" />
                        <p className="text-sm font-semibold text-primary">
                          What Miraa is surfacing next
                        </p>
                      </div>

                      <div className="mt-3 rounded-xl bg-surface-container-lowest p-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-outline">
                          Likely agenda
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {captureAgenda.map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/35"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {captureDetectedActions.map((action) => (
                          <div
                            key={action}
                            className="flex items-start gap-2 rounded-xl bg-surface-container-lowest px-3 py-2.5"
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
                            <p className="text-sm leading-relaxed text-on-surface-variant">
                              {action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Intelligent Documentation */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-lift group order-2 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-8 shadow-ambient lg:order-1"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-semibold text-primary">
                    SOAP Note — Draft
                  </span>
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-secondary/10 text-secondary rounded-full">
                    AI Generated
                  </span>
                </div>
                {[
                  {
                    label: "Subjective",
                    text: "Patient presents with 2-week history of RLQ pain, exacerbated by eating, causing nocturnal awakening...",
                  },
                  {
                    label: "Objective",
                    text: "Tenderness on palpation of RLQ. No rebound. Normal bowel sounds. Temp 37.2C...",
                  },
                  {
                    label: "Assessment",
                    text: "Suspected appendicitis vs. mesenteric adenitis. Differential includes...",
                  },
                  {
                    label: "Plan",
                    text: "Urgent USS abdomen. FBC, CRP, UEC. Nil by mouth. Surgical referral if...",
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-surface-container rounded-xl p-4">
                    <p className="text-xs label-text text-secondary mb-1">
                      {s.label}
                    </p>
                    <p className="text-sm text-on-surface-variant">{s.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <p className="label-text text-secondary mb-3">Document</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Intelligent Documentation
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                From the transcript, Miraa drafts structured clinical
                notes, referral letters, and follow-up actions — all formatted
                for your clinical system.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: Layers,
                    title: "Structured SOAP Notes",
                    desc: "Automatically formatted into Subjective, Objective, Assessment, and Plan sections.",
                  },
                  {
                    icon: Send,
                    title: "Referral Drafts",
                    desc: "Referral letters drafted from consultation context, ready for review.",
                  },
                  {
                    icon: Receipt,
                    title: "Billing Support",
                    desc: "MBS item number suggestions based on consultation content.",
                  },
                  {
                    icon: ListChecks,
                    title: "Follow-up Actions",
                    desc: "Pathology requests, recall reminders, and patient instructions captured.",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {item.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Review & Approve */}
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="label-text text-secondary mb-3">Review</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Review &amp; Approve
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Every AI-generated draft is presented for clinician review.
                Confidence indicators highlight areas that may need attention.
                The clinician edits, approves, or rejects — they are always the
                final authority.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: Eye,
                    title: "Full Visibility",
                    desc: "See exactly what the AI generated alongside the original transcript.",
                  },
                  {
                    icon: AlertTriangle,
                    title: "Confidence Indicators",
                    desc: "Low-confidence sections are flagged for closer clinician attention.",
                  },
                  {
                    icon: PenLine,
                    title: "Inline Editing",
                    desc: "Edit any section directly. Rewrite, restructure, or expand as needed.",
                  },
                  {
                    icon: ThumbsUp,
                    title: "Explicit Approval",
                    desc: "Nothing is saved or exported until the clinician clicks approve.",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {item.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-lift group bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/25 p-8 shadow-ambient"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-semibold text-primary">
                    Clinician Review
                  </span>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs label-text text-secondary">
                      Assessment
                    </p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-success-container text-success rounded-full">
                      High Confidence
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Suspected appendicitis vs. mesenteric adenitis.
                  </p>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs label-text text-secondary">
                      Medication Reference
                    </p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      Needs Review
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Paracetamol 500mg QID PRN — verify dosage and frequency.
                  </p>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs label-text text-secondary">
                      Referral Draft
                    </p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-success-container text-success rounded-full">
                      High Confidence
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Surgical referral letter drafted from consultation context.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 py-2.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-xl">
                    Approve &amp; Save
                  </button>
                  <button className="px-4 py-2.5 text-sm font-semibold text-primary bg-surface-container rounded-xl">
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 5: What the Clinician Reviews */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-3">Safety Gate</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              What the Clinician Reviews Before Anything is Saved
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              The clinician review step is mandatory. Nothing bypasses it. Here
              is exactly what the clinician sees and approves before any output
              leaves the system.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Clinical Notes",
                desc: "Every SOAP note, progress note, or visit summary is presented in full for review. The clinician can edit any section before approval.",
              },
              {
                icon: Send,
                title: "Referral Letters",
                desc: "Referral drafts include recipient details, clinical context, and urgency. The clinician reviews, edits, and signs off before sending.",
              },
              {
                icon: Receipt,
                title: "Billing Codes",
                desc: "Suggested MBS item numbers are displayed as recommendations. The clinician selects and confirms the final coding.",
              },
              {
                icon: ListChecks,
                title: "Follow-up Actions",
                desc: "Identified follow-up tasks are listed for review. The clinician decides which actions to action, defer, or dismiss.",
              },
              {
                icon: AlertTriangle,
                title: "Confidence Flags",
                desc: "Areas where the AI has lower certainty are highlighted with amber indicators, drawing clinician attention to sections that need closer review.",
              },
              {
                icon: Clock,
                title: "Audit Record",
                desc: "Every review action is timestamped and logged — including what was AI-generated, what was edited, and what was approved.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-lift group bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/25 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
              >
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-base font-bold text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Export & Integrate */}
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-lift group order-2 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/95 p-8 shadow-ambient lg:order-1"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-semibold text-primary">
                    Export Destinations
                  </span>
                </div>
                {[
                  {
                    name: "Best Practice",
                    status: "Pilot",
                    color: "bg-secondary/10 text-secondary",
                  },
                  {
                    name: "MedicalDirector",
                    status: "Pilot",
                    color: "bg-secondary/10 text-secondary",
                  },
                  {
                    name: "FHIR R4 Compatible",
                    status: "Planned",
                    color: "bg-surface-container-high text-outline",
                  },
                  {
                    name: "HL7 v2 Messaging",
                    status: "Planned",
                    color: "bg-surface-container-high text-outline",
                  },
                  {
                    name: "PDF / Printable Export",
                    status: "Available",
                    color: "bg-success-container text-success",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-surface-container rounded-xl p-4"
                  >
                    <span className="text-sm font-medium text-primary">
                      {item.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.color}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
                <div className="bg-surface-container rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span className="text-xs label-text text-secondary">
                      Audit Trail
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Every export is logged with timestamp, clinician ID, and
                    destination. Full traceability for compliance.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <p className="label-text text-secondary mb-3">Deliver</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Export &amp; Integrate
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Once approved, clinical notes and documents are exported to your
                clinical software. Every export is logged for compliance and
                audit purposes.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: Upload,
                    title: "Direct EHR Export",
                    desc: "Push approved notes directly to Best Practice, MedicalDirector, and more.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Full Audit Trail",
                    desc: "Every action — from AI generation to clinician approval to export — is logged.",
                  },
                  {
                    icon: Layers,
                    title: "Standards-Based",
                    desc: "FHIR R4 and HL7 v2 support planned for broad EHR/EMR compatibility.",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {item.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-atmosphere py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-3">Full Feature Set</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              Everything You Need
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = iconMap[feature.icon] || CheckCircle;
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="card-lift group bg-surface-container-lowest/95 rounded-2xl border border-outline-variant/25 p-6 shadow-ambient-sm transition-shadow hover:shadow-ambient"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-surface-container text-outline rounded-full">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-atmosphere py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Ready to See It in Action?
            </h2>
            <p className="text-on-surface-variant mb-8">
              Join the waitlist to hear when Miraa launches and when the
              14-day free trial opens for your workflow.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
            >
              Join the Waitlist
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
