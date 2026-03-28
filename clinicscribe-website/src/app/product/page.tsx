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
} from "lucide-react";
import Link from "next/link";
import { BRAND, WORKFLOW_STEPS, FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

export default function ProductPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Product
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            How ClinicScribe AI Works
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            From ambient listening to approved clinical notes — a complete
            workflow designed around clinical responsibility.
          </motion.p>
        </div>
      </section>

      {/* Workflow Diagram */}
      <section className="py-20 bg-surface">
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
                  className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm hover:shadow-ambient transition-shadow"
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

      {/* Section 1: Live & Recorded */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="label-text text-secondary mb-3">Capture</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Live &amp; Recorded
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Start ambient listening during a consultation, or upload a
                previously recorded session. ClinicScribe AI captures the
                conversation with medical-grade speech recognition.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: Mic,
                    title: "Ambient Listening",
                    desc: "Real-time capture during consultations with one tap.",
                  },
                  {
                    icon: Upload,
                    title: "Upload Recordings",
                    desc: "Import audio files from telehealth sessions or dictation devices.",
                  },
                  {
                    icon: Activity,
                    title: "Speaker Diarisation",
                    desc: "Automatically separate clinician and patient voices in the transcript.",
                  },
                  {
                    icon: FileAudio,
                    title: "Medical Terminology",
                    desc: "Clinical-grade vocabulary recognition for medications, conditions, and procedures.",
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
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-error animate-pulse-slow" />
                  <span className="text-sm font-semibold text-primary">
                    Recording in progress
                  </span>
                  <span className="text-xs text-outline ml-auto">12:34</span>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-xs label-text text-secondary mb-2">
                    Clinician
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    &quot;So the pain started about two weeks ago in the right
                    lower quadrant...&quot;
                  </p>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-xs label-text text-outline mb-2">
                    Patient
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    &quot;Yes, it gets worse after eating and sometimes wakes me
                    at night.&quot;
                  </p>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-xs label-text text-secondary mb-2">
                    Clinician
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    &quot;Any changes in bowel habits or appetite?&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-secondary rounded-full" />
                  </div>
                  <span className="text-xs text-outline">Processing</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Intelligent Documentation */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-2 lg:order-1 bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
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
                From the transcript, ClinicScribe AI drafts structured clinical
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

      {/* Section 3: Review & Approve */}
      <section className="py-20 bg-surface-container-low">
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
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
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
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
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
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
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

      {/* Section 4: What the Clinician Reviews */}
      <section className="py-20 bg-surface">
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
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm"
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

      {/* Section 5: Export & Integrate */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient order-2 lg:order-1"
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
                    color: "bg-green-100 text-green-700",
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
      <section className="py-20 bg-surface">
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
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm hover:shadow-ambient transition-shadow"
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
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Ready to See It in Action?
            </h2>
            <p className="text-on-surface-variant mb-8">
              Book a personalised demo to see how {BRAND.name} fits your
              clinical workflow.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
            >
              Book a Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
