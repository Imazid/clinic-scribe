"use client";

import { useState, useMemo, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, ChevronDown, CheckCircle } from "lucide-react";
import { PRELAUNCH, WAITLIST_ROLES } from "@/lib/constants";

type FormState = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full px-4 py-3 text-sm text-on-surface bg-surface-container-lowest rounded-xl outline-none focus:ring-2 focus:ring-secondary/30 placeholder:text-outline transition-all";
const selectClass =
  "w-full px-4 py-3 text-sm text-on-surface bg-surface-container-lowest rounded-xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all appearance-none";

function ConfettiParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300 - 100,
        rotation: Math.random() * 720,
        scale: Math.random() * 0.5 + 0.5,
        color: [
          "bg-secondary",
          "bg-secondary-container",
          "bg-tertiary",
          "bg-secondary-fixed",
        ][i % 4],
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute w-2 h-2 rounded-sm ${p.color}`}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: p.scale,
            opacity: 0,
            rotate: p.rotation,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

interface WaitlistFormProps {
  source?: string;
  className?: string;
}

export function WaitlistForm({ source = "waitlist_page", className = "" }: WaitlistFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
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
          name: name.trim(),
          email: email.trim(),
          role,
          source,
          website: honeypot,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setName("");
        setEmail("");
        setRole("");
        setHoneypot("");
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
    <div className={className}>
      <AnimatePresence mode="wait">
        {formState === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 shadow-ambient relative overflow-hidden"
          >
            <ConfettiParticles />
            <div className="relative z-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-success-container flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                {PRELAUNCH.successTitle}
              </h3>
              <p className="mt-2 text-on-surface-variant">
                {PRELAUNCH.successMessage}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-6 md:p-8 shadow-ambient"
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
                overflow: "hidden",
              }}
            >
              <label htmlFor="wf-website">Leave this field empty</label>
              <input
                id="wf-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Your name"
                aria-label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formState === "error") setFormState("idle");
                }}
                className={inputClass}
                required
              />
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  aria-label="Your role"
                  className={selectClass}
                >
                  <option value="">Your role</option>
                  {WAITLIST_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
              </div>
            </div>
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-on-primary transition-all hover:-translate-y-px hover:shadow-ambient-sm disabled:opacity-60"
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  {PRELAUNCH.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {formState === "error" && errorMessage && (
              <p className="text-sm text-error mt-3">{errorMessage}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
