"use client";

import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Calendar,
  CheckCircle,
  Database,
  FileText,
  Globe,
  Heart,
  Layers,
  Lock,
  Monitor,
  Send,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { BRAND, GENIE_INTEGRATION } from "@/lib/constants";

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

export default function GenieIntegrationPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center">
            <Link
              href="/integrations"
              className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              All Integrations
            </Link>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="px-3 py-1 text-xs font-semibold bg-secondary/10 text-secondary rounded-full">
                Pilot
              </span>
              <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                FHIR R4
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6">
              Genie Solutions Integration
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto mb-8">
              Seamlessly connect {BRAND.name} with Australia&apos;s leading
              specialist practice management software. Pull patient context,
              generate AI-assisted documentation, and push approved notes back
              — all through FHIR-standard APIs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
              >
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`mailto:${BRAND.supportEmail}?subject=Genie Integration Enquiry`}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-primary bg-surface-container-lowest rounded-full hover:bg-surface-container transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>

          {/* Reach Stats */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
          >
            {[
              { label: "Specialist Practices", value: GENIE_INTEGRATION.reach.practices, icon: Monitor },
              { label: "Practitioners", value: GENIE_INTEGRATION.reach.practitioners, icon: Users },
              { label: "Patients", value: GENIE_INTEGRATION.reach.patients, icon: Heart },
              { label: "Specialties", value: GENIE_INTEGRATION.reach.specialties, icon: Stethoscope },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm text-center">
                <stat.icon className="w-5 h-5 text-secondary mx-auto mb-3" />
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="label-text text-secondary mb-4">Data Flow</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              End-to-End Integration Workflow
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              From connecting your practice to pushing approved documentation
              back — every step is secure, auditable, and clinician-controlled.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-px bg-outline-variant -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {GENIE_INTEGRATION.dataFlow.map((step, i) => {
                const stepIcons = [Globe, ArrowDownToLine, Stethoscope, ShieldCheck, ArrowUpFromLine];
                const StepIcon = stepIcons[i] || Globe;
                return (
                  <motion.div
                    key={step.step}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm text-center z-10"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mx-auto mb-4">
                      <StepIcon className="w-5 h-5 text-on-primary" />
                    </div>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-secondary/10 text-secondary rounded-full mb-3">
                      Step {step.step}
                    </span>
                    <h3 className="text-sm font-bold text-primary mb-2">{step.title}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pull Capabilities */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5 text-secondary" />
                </div>
                <p className="label-text text-secondary">Pull from Genie</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Patient Context at Your Fingertips
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Before each consultation, {BRAND.name} pulls the patient&apos;s
                clinical context from Genie. This means the AI has the
                information it needs to draft accurate, contextual clinical
                notes — without the clinician re-entering data.
              </p>
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm">
                <h4 className="text-sm font-bold text-primary mb-4">
                  Example: Pre-Consultation Pull
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="bg-surface-container rounded-lg p-3">
                    <span className="text-secondary">GET</span>{" "}
                    <span className="text-on-surface-variant">/api/genie/patients/12345/summary</span>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3 text-on-surface-variant">
                    <p className="text-primary font-semibold mb-1">Response includes:</p>
                    <p>&#x2022; Patient demographics (name, DOB, contact)</p>
                    <p>&#x2022; Active conditions (diagnoses, problem list)</p>
                    <p>&#x2022; Allergies and intolerances</p>
                    <p>&#x2022; Recent observations (vitals, lab results)</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {GENIE_INTEGRATION.capabilities.pull.map((cap, i) => {
                const icons = [Users, Calendar, Heart, ShieldCheck, Database, Layers, Stethoscope];
                const CapIcon = icons[i] || Database;
                return (
                  <motion.div
                    key={cap.resource}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient-sm hover:shadow-ambient transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <CapIcon className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-primary">{cap.resource}</h4>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-secondary/10 text-secondary rounded">
                            {cap.fhirType}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {cap.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Push Capabilities */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-2 lg:order-1 space-y-4"
            >
              {GENIE_INTEGRATION.capabilities.push.map((cap, i) => {
                const icons = [FileText, Send, FileText, FileText];
                const CapIcon = icons[i] || FileText;
                return (
                  <motion.div
                    key={cap.resource}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient-sm hover:shadow-ambient transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <CapIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-primary">{cap.resource}</h4>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-primary/10 text-primary rounded">
                            {cap.fhirType}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {cap.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowUpFromLine className="w-5 h-5 text-primary" />
                </div>
                <p className="label-text text-secondary">Push to Genie</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-6">
                Approved Notes, Delivered Instantly
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Once the clinician reviews and approves an AI-generated note,
                it is pushed directly into the patient&apos;s Genie record as a
                FHIR DocumentReference. Referral letters land in outgoing
                correspondence, ready to send.
              </p>
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm">
                <h4 className="text-sm font-bold text-primary mb-4">
                  Example: Push Clinical Note
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="bg-surface-container rounded-lg p-3">
                    <span className="text-primary font-semibold">POST</span>{" "}
                    <span className="text-on-surface-variant">/api/genie/clinical-notes</span>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3 text-on-surface-variant">
                    <p>&#123;</p>
                    <p className="pl-4">&quot;patientId&quot;: &quot;12345&quot;,</p>
                    <p className="pl-4">&quot;letterType&quot;: &quot;clinical-note&quot;,</p>
                    <p className="pl-4">&quot;title&quot;: &quot;Progress Note — 21 Mar 2026&quot;,</p>
                    <p className="pl-4">&quot;content&quot;: &quot;S: Patient presents with...&quot;</p>
                    <p>&#125;</p>
                  </div>
                  <div className="flex items-center gap-2 text-secondary">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Creates DocumentReference in Genie</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FHIR Resources Table */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-4">Technical Specification</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Supported FHIR Resources
            </h2>
            <p className="text-on-surface-variant">
              All data exchange uses FHIR R4 resources, ensuring standards-based
              interoperability.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden"
          >
            <div className="grid grid-cols-3 bg-surface-container-high px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <span>Resource</span>
              <span>FHIR Type</span>
              <span>Direction</span>
            </div>
            {[
              ...GENIE_INTEGRATION.capabilities.pull.map((c) => ({
                ...c,
                direction: "Pull" as const,
              })),
              ...GENIE_INTEGRATION.capabilities.push.map((c) => ({
                ...c,
                direction: "Push" as const,
              })),
            ].map((item, i) => (
              <div
                key={`${item.resource}-${item.direction}`}
                className={`grid grid-cols-3 px-6 py-4 text-sm ${
                  i % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low/30"
                }`}
              >
                <span className="font-medium text-on-surface">{item.resource}</span>
                <span className="font-mono text-xs text-on-surface-variant">{item.fhirType}</span>
                <span className="flex items-center gap-1.5">
                  {item.direction === "Pull" ? (
                    <ArrowDownToLine className="w-3.5 h-3.5 text-secondary" />
                  ) : (
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      item.direction === "Pull" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {item.direction}
                  </span>
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-4">Security</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Built for Healthcare Security
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Every aspect of the Genie integration is designed with healthcare
              privacy and security at its core.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GENIE_INTEGRATION.security.map((item, i) => {
              const secIcons = [Lock, Layers, Globe, Database, FileText, ShieldCheck];
              const SecIcon = secIcons[i] || ShieldCheck;
              return (
                <motion.div
                  key={i}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm"
                >
                  <SecIcon className="w-5 h-5 text-secondary mb-4" />
                  <p className="text-sm text-on-surface leading-relaxed">{item}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setup Guide */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="label-text text-secondary mb-4">Getting Started</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Connect Your Practice
            </h2>
            <p className="text-on-surface-variant">
              Setting up the Genie integration is straightforward and supported
              by our onboarding team.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "1",
                title: `Register for ${BRAND.shortName}`,
                description:
                  `Sign up for ${BRAND.shortName} and indicate that your practice uses Genie Solutions. We will guide you through the partner onboarding.`,
              },
              {
                step: "2",
                title: "Marketplace Pairing",
                description:
                  `Pair your Genie practice with ${BRAND.shortName} through the Magentus Marketplace. This grants ${BRAND.shortName} secure, scoped API access to your practice data.`,
              },
              {
                step: "3",
                title: "Configure Data Scope",
                description:
                  `Choose which data ${BRAND.shortName} can access — patient demographics, appointments, clinical data. Minimise data access to what your workflow needs.`,
              },
              {
                step: "4",
                title: "Start Documenting",
                description:
                  `Begin using ${BRAND.shortName} with full Genie context. Patient data is pulled automatically, and approved notes flow back into Genie seamlessly.`,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-5 bg-surface-container-lowest rounded-2xl p-6 shadow-ambient-sm"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-on-primary">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary mb-1">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <Stethoscope className="w-10 h-10 text-secondary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
              Ready to Connect Genie with {BRAND.name}?
            </h2>
            <p className="text-on-surface-variant mb-8">
              Join the pilot programme and experience seamless documentation
              with your Genie Solutions practice management system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
              >
                Request Pilot Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`mailto:${BRAND.supportEmail}?subject=Genie Integration Pilot`}
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
