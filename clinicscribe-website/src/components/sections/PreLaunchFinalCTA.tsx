"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { PRELAUNCH } from "@/lib/constants";
import { LiveCount } from "@/components/ui/LiveCount";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { MagneticButton } from "@/components/ui/MagneticButton";

type FormState = "idle" | "submitting" | "success" | "error";

export function PreLaunchFinalCTA() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: email.trim(),
          role: "unknown",
          source: "final_cta",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setEmail("");
        setFormState("success");
      } else {
        setErrorMessage(data.message || "Something went wrong.");
        setFormState("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setFormState("error");
    }
  };

  return (
    <section className="relative hero-gradient py-24 lg:py-32 overflow-hidden">
      <FloatingElements variant="cta" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-on-primary md:text-4xl lg:text-5xl">
            Join the waitlist for launch
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-on-primary/70">
            Miraa is not live yet. We will email you as soon as the app launches
            and the 14-day free trial is ready.
          </p>

          {formState === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-6 py-3"
            >
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-semibold text-primary">
                {PRELAUNCH.successTitle}
              </span>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formState === "error") setFormState("idle");
                }}
                className="w-full sm:flex-1 px-5 py-3.5 text-sm text-on-surface bg-surface-container-lowest rounded-full outline-none focus:ring-2 focus:ring-secondary/30 placeholder:text-outline"
                required
              />
              <MagneticButton className="w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-6 py-3.5 font-semibold text-primary transition-shadow hover:shadow-ambient-lg disabled:opacity-60"
                >
                  {formState === "submitting" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {PRELAUNCH.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </MagneticButton>
            </form>
          )}

          {formState === "error" && errorMessage && (
            <p className="text-sm text-error-container mt-3">{errorMessage}</p>
          )}

          <p className="mt-6 text-sm text-on-primary/50">
            Join{" "}
            <span className="font-semibold text-on-primary/70">
              <LiveCount fallback={PRELAUNCH.socialProofCount} />
            </span>{" "}
            {PRELAUNCH.socialProofText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
