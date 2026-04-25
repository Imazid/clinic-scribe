"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Globe2,
  Network,
  UserCheck,
  Flag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { PinnedHorizontalScroll } from "@/components/ui/PinnedHorizontalScroll";

type ComplianceTone = "active" | "planned" | "live";

const complianceSlides: Array<{
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  status: string;
  tone: ComplianceTone;
}> = [
  {
    icon: Flag,
    eyebrow: "Sovereignty",
    title: "Australian-first",
    body:
      "Built around the Australian Privacy Principles and Privacy Act 1988. Patient data is hosted in AU regions by default — never routed offshore without explicit consent.",
    status: "By design",
    tone: "live",
  },
  {
    icon: Globe2,
    eyebrow: "Global posture",
    title: "HIPAA-equivalent",
    body:
      "Engineered to mirror HIPAA Privacy and Security Rule controls so the same architecture meets US and AU healthcare expectations from day one.",
    status: "By design",
    tone: "live",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Independent assurance",
    title: "SOC 2 Type II",
    body:
      "Trust Services Criteria controls are in place today. SOC 2 Type II audit is on the path for the GA window — pilot reports are available under NDA.",
    status: "Planned",
    tone: "planned",
  },
  {
    icon: Network,
    eyebrow: "Interoperability",
    title: "FHIR R4 compliant",
    body:
      "Every approved note, referral, and discharge summary is shaped as a FHIR DocumentReference so existing PMS integrations like Magentus Genie work out of the box.",
    status: "Built in",
    tone: "live",
  },
  {
    icon: Lock,
    eyebrow: "Encryption",
    title: "End-to-end encryption",
    body:
      "TLS 1.3 in transit, AES-256 at rest. Audio is processed and discarded; only the structured note and provenance metadata are persisted with strict access controls.",
    status: "Active",
    tone: "active",
  },
  {
    icon: UserCheck,
    eyebrow: "Clinician control",
    title: "Clinician-in-the-loop",
    body:
      "Miraa drafts. The clinician approves. Nothing is exported, billed, or sent to an EHR until a clinician reviews and signs off — never autonomous, never silent.",
    status: "Active",
    tone: "active",
  },
];

const toneStyles: Record<ComplianceTone, { iconBg: string; iconText: string; chipBg: string; chipText: string; dot: string }> = {
  active: {
    iconBg: "bg-success-container/30",
    iconText: "text-success-container",
    chipBg: "bg-success/15",
    chipText: "text-success-container",
    dot: "bg-success-container",
  },
  planned: {
    iconBg: "bg-secondary/20",
    iconText: "text-secondary-fixed-dim",
    chipBg: "bg-secondary/15",
    chipText: "text-secondary-fixed-dim",
    dot: "bg-secondary-fixed-dim",
  },
  live: {
    iconBg: "bg-tertiary/20",
    iconText: "text-tertiary-container",
    chipBg: "bg-tertiary/15",
    chipText: "text-tertiary-container",
    dot: "bg-tertiary-container",
  },
};

function ComplianceCard({
  index,
  total,
  icon: Icon,
  eyebrow,
  title,
  body,
  status,
  tone,
}: {
  index: number;
  total: number;
} & (typeof complianceSlides)[number]) {
  const t = toneStyles[tone];
  return (
    <div className="w-full max-w-3xl px-6 py-12 lg:py-16">
      <div className="rounded-3xl bg-white/[0.04] p-10 lg:p-14 backdrop-blur-sm border border-white/5 shadow-ambient-lg">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] font-bold text-on-primary/50">
          <span>{eyebrow}</span>
          <span>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className={`mt-7 flex h-16 w-16 items-center justify-center rounded-2xl ${t.iconBg}`}>
          <Icon className={`h-7 w-7 ${t.iconText}`} />
        </div>
        <h3 className="mt-7 text-3xl lg:text-4xl font-bold tracking-tight text-on-primary">
          {title}
        </h3>
        <p className="mt-5 text-base lg:text-lg leading-relaxed text-on-primary/70 max-w-xl">
          {body}
        </p>
        <span
          className={`mt-7 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${t.chipBg} ${t.chipText}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
          {status}
        </span>
      </div>
    </div>
  );
}

export function SafetyFirst() {
  return (
    <section className="bg-primary py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="label-text text-secondary-fixed">Safety by design</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-on-primary md:text-4xl lg:text-5xl">
            Verification stays with the clinician
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-on-primary/70">
            Safety is not an afterthought. Every stage of the workflow keeps the clinician in control of what was heard, what was found, and what is still under review.
          </p>
          <p className="mt-3 text-[11px] tracking-[0.18em] uppercase font-bold text-on-primary/40 hidden lg:block">
            Scroll horizontally through our compliance posture →
          </p>
        </motion.div>
      </div>

      <PinnedHorizontalScroll className="mt-12 lg:mt-16">
        {complianceSlides.map((slide, i) => (
          <ComplianceCard
            key={slide.title}
            index={i}
            total={complianceSlides.length}
            {...slide}
          />
        ))}
      </PinnedHorizontalScroll>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-16 max-w-3xl rounded-2xl bg-white/5 p-8 text-center backdrop-blur-sm"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/20">
            <ShieldAlert className="h-6 w-6 text-error-container" />
          </div>
          <h3 className="text-xl font-bold text-on-primary">
            Not autonomous clinical decision-making
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-on-primary/70">
            {BRAND.name} assists with documentation and workflow only. It does not diagnose, prescribe, or make clinical decisions. The clinician is always responsible for clinical judgment, and every AI output must be reviewed and approved before it is finalised.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
