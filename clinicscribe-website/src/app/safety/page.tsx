"use client";

import { motion } from "framer-motion";
import {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Lock,
  KeyRound,
  Eye,
  Ban,
  Globe,
  Scale,
  FileWarning,
  HeartPulse,
  Fingerprint,
  Users,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { BRAND, SAFETY_PRINCIPLES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Lock,
  KeyRound,
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

export default function SafetyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Trust &amp; Governance
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            Safety &amp; Compliance
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            Built for clinical responsibility. Every design decision prioritises
            patient safety, clinician authority, and regulatory readiness.
          </motion.p>
        </div>
      </section>

      {/* Safety Principles Grid */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="label-text text-secondary mb-3">Foundations</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              Core Safety Principles
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAFETY_PRINCIPLES.map((principle, i) => {
              const Icon = iconMap[principle.icon] || ShieldCheck;
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {principle.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1. Clinician-in-the-Loop */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <UserCheck className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                1. Clinician-in-the-Loop Design
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                {BRAND.name} is architecturally designed so that no AI-generated
                content reaches a patient record, referral, or prescription
                without explicit clinician approval.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                The clinician is not merely notified — they are the mandatory
                gatekeeper. The system cannot bypass this step. This is a
                deliberate design constraint, not an optional feature.
              </p>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
            >
              <div className="space-y-4">
                {[
                  { step: "AI drafts output", status: "Automated" },
                  { step: "Clinician reviews draft", status: "Required" },
                  { step: "Clinician edits if needed", status: "Available" },
                  { step: "Clinician explicitly approves", status: "Required" },
                  { step: "Output saved / exported", status: "Only after approval" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-surface-container rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-on-surface">
                        {item.step}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        item.status === "Required"
                          ? "bg-secondary/10 text-secondary"
                          : item.status === "Automated"
                          ? "bg-surface-container-high text-outline"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Mandatory Review */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-bold text-primary">
                    Mandatory Review Gates
                  </span>
                </div>
                {[
                  "Clinical notes (SOAP, progress, visit summaries)",
                  "Referral letters",
                  "Prescription drafts",
                  "Billing code suggestions",
                  "Follow-up task lists",
                  "Patient instructions",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3"
                    style={
                      i > 0
                        ? { borderTop: "1px solid rgba(196, 198, 208, 0.15)" }
                        : undefined
                    }
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <Eye className="w-3.5 h-3.5 text-secondary" />
                    </div>
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-secondary/10 text-secondary rounded-full whitespace-nowrap">
                      Review Required
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                2. Mandatory Review of AI-Generated Outputs
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Every type of AI-generated output is subject to mandatory
                clinician review. There are no exceptions, no bulk-approve
                shortcuts, and no automatic export paths.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                This applies to all output types — from clinical notes to
                referral letters to prescription drafts. The system enforces
                individual review for each document before it can be saved or
                exported.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Audit Logs */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <ClipboardList className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                3. Audit Logs &amp; Traceability
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Every interaction with the system is recorded. AI outputs,
                clinician edits, approval actions, and exports are logged with
                timestamps and user identification.
              </p>
              <ul className="space-y-3">
                {[
                  "Timestamped AI output generation",
                  "Record of all clinician edits and modifications",
                  "Approval and rejection actions with clinician ID",
                  "Export destinations and timestamps",
                  "Confidence scores at time of generation",
                  "Session recordings retention policy logging",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
            >
              <p className="label-text text-secondary mb-4">
                Sample Audit Entry
              </p>
              <div className="space-y-3 font-mono text-xs">
                {[
                  {
                    time: "14:23:01",
                    event: "AI Note Generated",
                    detail: "SOAP note, confidence: 0.92",
                  },
                  {
                    time: "14:23:45",
                    event: "Clinician Opened Review",
                    detail: "Dr. Smith, ID: CS-0042",
                  },
                  {
                    time: "14:24:12",
                    event: "Clinician Edit",
                    detail: "Modified: Assessment section",
                  },
                  {
                    time: "14:25:03",
                    event: "Clinician Approved",
                    detail: "Approved with edits",
                  },
                  {
                    time: "14:25:04",
                    event: "Exported",
                    detail: "Destination: Best Practice",
                  },
                ].map((entry, i) => (
                  <div
                    key={i}
                    className="bg-surface-container rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-outline">{entry.time}</span>
                      <span className="text-primary font-semibold">
                        {entry.event}
                      </span>
                    </div>
                    <span className="text-on-surface-variant">
                      {entry.detail}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Access Controls */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 mx-auto">
                <Lock className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                4. Access Controls
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Role-based access control ensures that only authorised
                clinicians can review, approve, and export clinical
                documentation. Administrative and clinical roles are separated.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Role-Based Access",
                  desc: "Separate permissions for clinicians, practice managers, and administrators.",
                },
                {
                  icon: Fingerprint,
                  title: "Authentication",
                  desc: "Secure login with multi-factor authentication support for all users.",
                },
                {
                  icon: Lock,
                  title: "Session Management",
                  desc: "Automatic session timeouts and audit logging for all access events.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm text-center"
                >
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                    <item.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-base font-bold text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Secure Handling */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <KeyRound className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                5. Secure Handling of Sensitive Health Information
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Health data is treated with the highest level of care. All data
                is encrypted in transit and at rest, and the system is designed
                to minimise data retention.
              </p>
              <ul className="space-y-3">
                {[
                  "TLS 1.3 encryption for all data in transit",
                  "AES-256 encryption for all data at rest",
                  "Configurable audio deletion after transcription",
                  "Australian data residency by default",
                  "No third-party data sharing without explicit consent",
                  "Regular security audits and penetration testing",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="w-10 h-10 text-on-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  Encryption at Every Layer
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  Data protection is not an afterthought. It is embedded in every
                  layer of the system architecture.
                </p>
                <div className="space-y-3">
                  {["In Transit", "At Rest", "In Processing", "In Backup"].map(
                    (layer, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-surface-container rounded-xl p-3"
                      >
                        <span className="text-sm text-on-surface-variant">
                          {layer}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Encrypted
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Privacy & Consent */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp}>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 mx-auto">
                <Scale className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                6. Privacy &amp; Consent Workflow
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                Patient consent is built into the workflow. Clinics can configure
                their consent approach — per-visit verbal consent, written
                consent, or practice-level consent with opt-out. The system
                records consent status for every session.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Configurable Consent",
                  desc: "Set consent policies per practice, per clinician, or per visit type.",
                },
                {
                  title: "Consent Recording",
                  desc: "Consent status is logged and associated with every recording session.",
                },
                {
                  title: "Patient Opt-Out",
                  desc: "Patients can opt out at any time. The system respects and records the preference.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm"
                >
                  <h3 className="text-base font-bold text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Human Oversight for Prescriptions */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <HeartPulse className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                7. Human Oversight for Prescriptions &amp; Referrals
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Prescription drafting and referral generation carry elevated
                clinical responsibility. These outputs receive additional
                safeguards beyond standard note review.
              </p>
              <ul className="space-y-3">
                {[
                  "Prescriptions are drafted only — never auto-submitted",
                  "Clinician must verify drug, dose, frequency, and quantity",
                  "Referral letters require explicit clinician sign-off",
                  "Both output types are flagged for mandatory, individual review",
                  "No batch-approve functionality for prescriptions or referrals",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
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
                <div className="bg-surface-container rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-text text-secondary">
                      Prescription Draft
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      Requires Clinician Approval
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-on-surface-variant">
                    <p>
                      <strong className="text-primary">Drug:</strong> Amoxicillin 500mg
                    </p>
                    <p>
                      <strong className="text-primary">Dose:</strong> 1 capsule TDS
                    </p>
                    <p>
                      <strong className="text-primary">Duration:</strong> 5 days
                    </p>
                    <p>
                      <strong className="text-primary">Quantity:</strong> 15
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">
                        Clinician Verification Required
                      </p>
                      <p className="text-xs text-amber-700">
                        This draft was pre-populated from consultation context.
                        Verify all details against your clinical judgment before
                        approving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. NOT Autonomous — Prominent Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            {...fadeUp}
            className="bg-surface-container rounded-2xl p-8 md:p-12 shadow-ambient"
          >
            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Ban className="w-7 h-7 text-on-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight mb-2">
                  Not Autonomous Clinical Decision-Making
                </h2>
                <p className="text-on-surface-variant">
                  This distinction is fundamental to how {BRAND.name} is
                  designed, built, and positioned.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-on-surface-variant leading-relaxed">
                {BRAND.name} is a{" "}
                <strong className="text-primary">
                  clinical documentation assistant
                </strong>
                . It drafts structured notes, referral letters, and follow-up
                actions based on consultation audio. It does not diagnose, treat,
                prescribe, or make clinical decisions.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                The clinician is always the decision-maker. The system provides
                documentation support — the clinician provides clinical judgment.
                These roles are architecturally separated and cannot be
                conflated.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-surface-container-lowest rounded-xl p-6">
                  <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    What the system does
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Transcribes clinical conversations",
                      "Drafts structured clinical notes",
                      "Pre-populates referral letters",
                      "Suggests billing codes",
                      "Captures follow-up actions",
                      "Presents drafts for review",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-on-surface-variant"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-6">
                  <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-error" />
                    What the system does NOT do
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Diagnose medical conditions",
                      "Make treatment decisions",
                      "Prescribe medications autonomously",
                      "Send referrals without approval",
                      "Override clinician judgment",
                      "Bypass the review step",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-on-surface-variant"
                      >
                        <XCircle className="w-3.5 h-3.5 text-error mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. Australia-first Compliance */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                9. Australia-First Compliance Posture
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                {BRAND.name} is designed and built for Australian healthcare
                from the ground up. Compliance is not retrofitted — it is
                foundational.
              </p>
              <ul className="space-y-3">
                {[
                  "Australian Privacy Principles (APPs) alignment",
                  "My Health Records Act considerations",
                  "Healthcare Identifiers Act awareness",
                  "Australian data residency by default",
                  "Designed for TGA regulatory awareness (not a medical device)",
                  "State and territory health records legislation awareness",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
                10. International Readiness
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                While Australia is our primary market, the system architecture
                is designed for international compliance readiness.
              </p>
              <ul className="space-y-3">
                {[
                  "HIPAA-ready architecture for US market expansion",
                  "GDPR-ready data handling for European markets",
                  "Configurable data residency per region",
                  "Modular compliance framework for new jurisdictions",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-outline mt-0.5 shrink-0" />
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 11. What the system does not automate + What should never be automated */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Clear Boundaries
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Being explicit about what the system does not do — and what should
              never be automated without review — is a core part of our safety
              commitment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              {...fadeUp}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileWarning className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary">
                  What the System Does Not Automate
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Clinical diagnosis or differential diagnosis",
                  "Treatment planning or decision-making",
                  "Medication prescribing or dispensing",
                  "Referral sending (only drafting)",
                  "Patient triage or risk assessment",
                  "Billing submission (only code suggestions)",
                  "Clinical coding validation",
                  "Patient communication or advice",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-outline mt-0.5 shrink-0" />
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <h3 className="text-lg font-bold text-primary">
                  What Should Never Be Automated Without Review
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Prescription generation and submission",
                  "Referral letters sent to other clinicians",
                  "Clinical notes saved to patient records",
                  "Billing claims submitted to Medicare",
                  "Patient discharge instructions",
                  "Pathology and imaging orders",
                  "Specialist opinion letters",
                  "Medico-legal documentation",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                    <span className="text-sm text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Have Questions About Safety?
            </h2>
            <p className="text-on-surface-variant mb-8">
              We welcome scrutiny. Book a demo to discuss our safety
              architecture, or reach out directly at{" "}
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="text-secondary hover:underline"
              >
                {BRAND.supportEmail}
              </a>
              .
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
