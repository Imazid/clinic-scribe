"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  Monitor,
  Video,
  Receipt,
  Pill,
  Globe,
  Send,
  ShieldCheck,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Database,
} from "lucide-react";
import Link from "next/link";
import { BRAND, INTEGRATIONS, GENIE_INTEGRATION } from "@/lib/constants";
import type { IntegrationStatus } from "@/lib/constants";

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

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Clinical Software": Monitor,
  Telehealth: Video,
  Standards: Layers,
  Prescribing: Pill,
  Billing: Receipt,
};

const statusStyles: Record<IntegrationStatus, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-green-100", text: "text-green-700", label: "Available" },
  pilot: { bg: "bg-secondary/10", text: "text-secondary", label: "Pilot" },
  planned: { bg: "bg-surface-container-high", text: "text-outline", label: "Planned" },
};

// Group integrations by category
const grouped = INTEGRATIONS.reduce<Record<string, typeof INTEGRATIONS>>((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {});

export default function IntegrationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Integrations
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            Integrations
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            Connect with the systems your clinic already uses. {BRAND.name}{" "}
            exports approved documentation to your existing clinical software.
          </motion.p>
        </div>
      </section>

      {/* Integration Grid by Category */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          {Object.entries(grouped).map(([category, items], catIdx) => {
            const CatIcon = categoryIcons[category] || Globe;
            return (
              <div key={category} className={catIdx > 0 ? "mt-16" : ""}>
                <motion.div {...fadeUp} className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <CatIcon className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary tracking-tight">
                    {category}
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((integration, i) => {
                    const style = statusStyles[integration.status];
                    return (
                      <motion.div
                        key={integration.name}
                        {...stagger}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm hover:shadow-ambient transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-bold text-primary">
                            {integration.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {integration.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Genie Solutions Featured Integration */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="label-text text-secondary mb-4">Featured Integration</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight mb-4">
              Genie Solutions by Magentus
            </h2>
            <p className="text-lg text-on-surface-variant max-w-3xl mx-auto">
              {GENIE_INTEGRATION.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {Object.entries(GENIE_INTEGRATION.reach).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-on-surface-variant capitalize">{key}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pull / Push Capabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Pull */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">Pull from Genie</h3>
                  <p className="text-xs text-on-surface-variant">Read patient data before consultations</p>
                </div>
              </div>
              <div className="space-y-3">
                {GENIE_INTEGRATION.capabilities.pull.map((cap) => (
                  <div
                    key={cap.resource}
                    className="flex items-start gap-3 bg-surface-container rounded-xl p-4"
                  >
                    <Database className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-on-surface">{cap.resource}</p>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-secondary/10 text-secondary rounded">
                          {cap.fhirType}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Push */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowUpFromLine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">Push to Genie</h3>
                  <p className="text-xs text-on-surface-variant">Write approved notes back to patient files</p>
                </div>
              </div>
              <div className="space-y-3">
                {GENIE_INTEGRATION.capabilities.push.map((cap) => (
                  <div
                    key={cap.resource}
                    className="flex items-start gap-3 bg-surface-container rounded-xl p-4"
                  >
                    <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-on-surface">{cap.resource}</p>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-primary/10 text-primary rounded">
                          {cap.fhirType}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Data Flow Steps */}
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
            <h3 className="text-2xl font-bold text-primary tracking-tight text-center mb-10">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {GENIE_INTEGRATION.dataFlow.map((step, i) => {
                const stepIcons = [Monitor, Users, Stethoscope, ShieldCheck, Send];
                const StepIcon = stepIcons[i] || Globe;
                return (
                  <motion.div
                    key={step.step}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mx-auto mb-4">
                      <span className="text-sm font-bold text-on-primary">{step.step}</span>
                    </div>
                    <StepIcon className="w-5 h-5 text-secondary mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-primary mb-2">{step.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{step.description}</p>
                    {i < GENIE_INTEGRATION.dataFlow.length - 1 && (
                      <ArrowRight className="hidden md:block w-4 h-4 text-outline-variant absolute -right-4 top-1/2 -translate-y-1/2 z-10" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 bg-surface-container-lowest rounded-2xl p-8 shadow-ambient-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-primary">Security & Compliance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GENIE_INTEGRATION.security.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                  <p className="text-sm text-on-surface-variant">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...fadeUp} className="text-center mt-12">
            <Link
              href="/integrations/genie"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
            >
              View Full Genie Integration Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FHIR / HL7 Standards */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="label-text text-secondary mb-3">
                Interoperability Standards
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                FHIR &amp; HL7 Standards Support
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                We are building towards FHIR R4 and HL7 v2 compatibility to
                enable {BRAND.name} to integrate with a broad range of EHR/EMR
                systems — both in Australia and internationally.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: "FHIR R4 Resources",
                    desc: "Structured clinical data mapped to FHIR resources for standardised exchange.",
                  },
                  {
                    title: "HL7 v2 Messaging",
                    desc: "Legacy messaging support for established health information systems.",
                  },
                  {
                    title: "Document References",
                    desc: "Clinical documents attached as FHIR DocumentReference resources for traceability.",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-secondary" />
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
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mx-auto mb-6">
                  <Layers className="w-8 h-8 text-on-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  Standards-Based Architecture
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  Built on healthcare interoperability standards from the ground
                  up.
                </p>
                <div className="space-y-3">
                  {[
                    { name: "FHIR R4", status: "In Development" },
                    { name: "HL7 v2", status: "Planned" },
                    { name: "CDA Documents", status: "Planned" },
                    { name: "IHE Profiles", status: "Under Review" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-surface-container rounded-xl p-3"
                    >
                      <span className="text-sm font-medium text-on-surface">
                        {item.name}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-surface-container-high text-outline rounded-full">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* eRx Prescription Workflow */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-2 lg:order-1 bg-surface-container-lowest rounded-2xl p-8 shadow-ambient"
            >
              <div className="flex items-center gap-3 mb-6">
                <Pill className="w-5 h-5 text-secondary" />
                <span className="text-sm font-bold text-primary">
                  Prescription Drafting Workflow
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    text: "Medication discussed during consultation",
                    role: "AI Capture",
                  },
                  {
                    step: "2",
                    text: "Draft pre-populated with drug, dose, frequency",
                    role: "AI Draft",
                  },
                  {
                    step: "3",
                    text: "Clinician reviews and verifies all details",
                    role: "Clinician Review",
                  },
                  {
                    step: "4",
                    text: "Clinician approves through existing prescribing system",
                    role: "Clinician Approval",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-center gap-4 bg-surface-container rounded-xl p-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-sm font-bold text-secondary">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-on-surface-variant">
                        {item.text}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-surface-container-high text-outline rounded-full whitespace-nowrap">
                      {item.role}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-amber-700">
                  <strong>Important:</strong> {BRAND.name} provides prescription
                  drafting assistance only. Every prescription must be reviewed,
                  verified, and approved by the clinician through their existing
                  prescribing workflow. There is no autonomous prescribing.
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <p className="label-text text-secondary mb-3">Prescribing</p>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                eRx Prescription Workflow Support
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                When medications are discussed during a consultation,{" "}
                {BRAND.name} can pre-populate prescription details as a draft.
                This is strictly a drafting tool — the clinician must review and
                approve through their existing prescribing system.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Integration with eRx Script Exchange is on the roadmap,
                enabling pre-populated drafts to flow into the clinician&apos;s
                prescribing interface for final verification and approval.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Request Integration CTA */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <Send className="w-10 h-10 text-secondary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Need a Specific Integration?
            </h2>
            <p className="text-on-surface-variant mb-8">
              We are actively building integrations based on clinician feedback.
              If your clinical system is not listed, let us know — we prioritise
              based on demand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
              >
                Request an Integration
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`mailto:${BRAND.supportEmail}?subject=Integration Request`}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-primary bg-surface-container-lowest rounded-full hover:bg-surface-container transition-colors"
              >
                Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
