"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Monitor,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { BRAND } from "@/lib/constants";

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

type FormState = "idle" | "submitting" | "success" | "error";

interface FormData {
  fullName: string;
  email: string;
  clinicName: string;
  clinicSize: string;
  role: string;
  specialty: string;
  currentEhr: string;
  painPoint: string;
  consent: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  clinicName: "",
  clinicSize: "",
  role: "",
  specialty: "",
  currentEhr: "",
  painPoint: "",
  consent: false,
};

const benefits = [
  {
    icon: Monitor,
    title: "Personalised Walkthrough",
    description:
      "See the full workflow tailored to your specialty — from ambient capture to approved clinical notes.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Architecture Deep-Dive",
    description:
      "Understand the mandatory review gates, audit trails, and confidence indicators that keep clinicians in control.",
  },
  {
    icon: Clock,
    title: "Integration Assessment",
    description:
      "Discuss how ClinicScribe AI integrates with your current clinical software and workflow.",
  },
];

const inputClass =
  "w-full px-4 py-3 text-sm text-on-surface bg-surface-container-lowest rounded-xl outline-none focus:ring-2 focus:ring-secondary/30 placeholder:text-outline transition-all";
const selectClass =
  "w-full px-4 py-3 text-sm text-on-surface bg-surface-container-lowest rounded-xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all appearance-none";
const labelClass = "block text-sm font-semibold text-primary mb-1.5";

export default function DemoPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.clinicName.trim())
      newErrors.clinicName = "Clinic name is required";
    if (!formData.clinicSize) newErrors.clinicSize = "Please select clinic size";
    if (!formData.role) newErrors.role = "Please select your role";
    if (!formData.consent)
      newErrors.consent = "Consent is required to proceed";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormState("submitting");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would send to your API
    setFormState("success");
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="label-text text-secondary mb-4">
            Get Started
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6"
          >
            See {BRAND.name} in Action
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto"
          >
            Book a personalised demo for your practice. See the full workflow
            from ambient capture to approved clinical notes.
          </motion.p>
        </div>
      </section>

      {/* Form + Benefits */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div {...fadeUp} className="lg:col-span-3">
              {formState === "success" ? (
                <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 shadow-ambient text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">
                    Thank You!
                  </h3>
                  <p className="text-on-surface-variant mb-2">
                    Your demo request has been received. Our team will be in
                    touch within 1-2 business days to schedule your personalised
                    walkthrough.
                  </p>
                  <p className="text-sm text-outline">
                    In the meantime, explore our{" "}
                    <a href="/product" className="text-secondary hover:underline">
                      product page
                    </a>{" "}
                    or{" "}
                    <a href="/safety" className="text-secondary hover:underline">
                      safety architecture
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-ambient"
                >
                  <h3 className="text-xl font-bold text-primary mb-6">
                    Request a Demo
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className={labelClass}>
                        Full Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Dr. Jane Smith"
                        value={formData.fullName}
                        onChange={(e) =>
                          updateField("fullName", e.target.value)
                        }
                        className={inputClass}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-error mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className={labelClass}>
                        Email <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="jane@clinic.com.au"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className={inputClass}
                      />
                      {errors.email && (
                        <p className="text-xs text-error mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Clinic Name */}
                    <div>
                      <label className={labelClass}>
                        Clinic Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your clinic name"
                        value={formData.clinicName}
                        onChange={(e) =>
                          updateField("clinicName", e.target.value)
                        }
                        className={inputClass}
                      />
                      {errors.clinicName && (
                        <p className="text-xs text-error mt-1">
                          {errors.clinicName}
                        </p>
                      )}
                    </div>

                    {/* Clinic Size */}
                    <div>
                      <label className={labelClass}>
                        Clinic Size <span className="text-error">*</span>
                      </label>
                      <select
                        value={formData.clinicSize}
                        onChange={(e) =>
                          updateField("clinicSize", e.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="">Select size</option>
                        <option value="solo">Solo</option>
                        <option value="2-5">2-5 clinicians</option>
                        <option value="6-10">6-10 clinicians</option>
                        <option value="11-25">11-25 clinicians</option>
                        <option value="26-50">26-50 clinicians</option>
                        <option value="50+">50+ clinicians</option>
                      </select>
                      {errors.clinicSize && (
                        <p className="text-xs text-error mt-1">
                          {errors.clinicSize}
                        </p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label className={labelClass}>
                        Your Role <span className="text-error">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => updateField("role", e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select role</option>
                        <option value="gp">GP</option>
                        <option value="specialist">Specialist</option>
                        <option value="practice-manager">
                          Practice Manager
                        </option>
                        <option value="allied-health">Allied Health</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.role && (
                        <p className="text-xs text-error mt-1">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className={labelClass}>Specialty</label>
                      <input
                        type="text"
                        placeholder="e.g. Cardiology, Physiotherapy"
                        value={formData.specialty}
                        onChange={(e) =>
                          updateField("specialty", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    {/* Current EHR */}
                    <div className="md:col-span-2">
                      <label className={labelClass}>Current EHR/EMR</label>
                      <select
                        value={formData.currentEhr}
                        onChange={(e) =>
                          updateField("currentEhr", e.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="">Select your system</option>
                        <option value="best-practice">Best Practice</option>
                        <option value="medical-director">
                          MedicalDirector
                        </option>
                        <option value="genie">Genie Solutions</option>
                        <option value="other">Other</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    {/* Pain Point */}
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Biggest Documentation Pain Point
                      </label>
                      <textarea
                        placeholder="Tell us about your biggest documentation challenge..."
                        value={formData.painPoint}
                        onChange={(e) =>
                          updateField("painPoint", e.target.value)
                        }
                        rows={4}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {/* Consent */}
                    <div className="md:col-span-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consent}
                          onChange={(e) =>
                            updateField("consent", e.target.checked)
                          }
                          className="mt-1 w-4 h-4 rounded accent-secondary"
                        />
                        <span className="text-sm text-on-surface-variant">
                          I consent to being contacted about {BRAND.name}. We
                          respect your privacy and will not share your
                          information with third parties.
                        </span>
                      </label>
                      {errors.consent && (
                        <p className="text-xs text-error mt-1">
                          {errors.consent}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={formState === "submitting"}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {formState === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Request a Demo
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {formState === "error" && (
                    <p className="text-sm text-error mt-4">
                      Something went wrong. Please try again or contact us at{" "}
                      <a
                        href={`mailto:${BRAND.demoEmail}`}
                        className="underline"
                      >
                        {BRAND.demoEmail}
                      </a>
                      .
                    </p>
                  )}
                </form>
              )}
            </motion.div>

            {/* Benefits */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <h3 className="text-lg font-bold text-primary mb-6">
                What to Expect
              </h3>
              <div className="space-y-5">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    {...stagger}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 bg-surface-container rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-semibold text-primary">
                    Demo Duration
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  Demos typically run 30-45 minutes and are tailored to your
                  practice type and clinical workflow. We will reach out within
                  1-2 business days to schedule.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pilot Program CTA */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            {...fadeUp}
            className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-ambient text-center"
          >
            <Send className="w-8 h-8 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary mb-3">
              Interested in Our Pilot Program?
            </h3>
            <p className="text-sm text-on-surface-variant mb-4 max-w-lg mx-auto">
              We are running structured pilot programs for clinics ready to be
              early adopters. Pilots include onboarding, training, full feature
              access, and regular check-ins.
            </p>
            <p className="text-sm text-on-surface-variant">
              Contact us at{" "}
              <a
                href={`mailto:${BRAND.demoEmail}`}
                className="text-secondary hover:underline font-medium"
              >
                {BRAND.demoEmail}
              </a>{" "}
              to learn more.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
