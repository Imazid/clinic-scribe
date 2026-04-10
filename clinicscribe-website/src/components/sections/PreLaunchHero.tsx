"use client";

import { useState, useMemo, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, ChevronDown, CheckCircle } from "lucide-react";
import { PRELAUNCH, WAITLIST_ROLES } from "@/lib/constants";
import { WordRotate } from "@/components/ui/WordRotate";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FloatingElements } from "@/components/ui/FloatingElements";
import { GradientMesh } from "@/components/ui/GradientMesh";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

type FormState = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full px-4 py-3 text-sm text-on-surface bg-surface-container-lowest rounded-xl outline-none focus:ring-2 focus:ring-secondary/30 placeholder:text-outline transition-all";
const selectClass =
  "w-full px-4 py-3 text-sm text-on-surface bg-surface-container-lowest rounded-xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all appearance-none";

const avatarInitials = ["DS", "JK", "AM", "RL"];
const avatarColors = [
  "bg-secondary",
  "bg-primary-container",
  "bg-secondary-fixed-dim",
  "bg-primary",
];

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
          "bg-primary",
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

export function PreLaunchHero() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
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
          source: "hero",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setName("");
        setEmail("");
        setRole("");
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
    <section className="relative min-h-screen overflow-hidden bg-surface flex items-center pt-24 pb-16">
      {/* Background layers */}
      <GradientMesh />
      <FloatingElements variant="hero" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Coming Soon badge */}
          <motion.div variants={item}>
            <span className="label-text inline-flex items-center gap-2 rounded-full bg-secondary-fixed/20 px-4 py-1.5 text-secondary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
              </span>
              Coming Soon
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="mt-8 text-5xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl"
          >
            {PRELAUNCH.headline}{" "}
            <WordRotate words={PRELAUNCH.rotatingWords} />{" "}
            <br className="hidden sm:block" />
            {PRELAUNCH.headlineSuffix}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="mt-6 text-lg leading-relaxed text-on-surface-variant max-w-2xl md:text-xl"
          >
            {PRELAUNCH.subheadline}
          </motion.p>

          {/* Email signup form */}
          <motion.div
            variants={item}
            id="waitlist-form"
            className="mt-10 w-full max-w-2xl"
          >
            <AnimatePresence mode="wait">
              {formState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-8 shadow-ambient relative overflow-hidden"
                >
                  <ConfettiParticles />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-green-600" />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formState === "error") setFormState("idle");
                      }}
                      className={inputClass}
                      required
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Your role</option>
                      {WAITLIST_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-semibold text-on-primary transition-all hover:shadow-ambient-lg hover:opacity-95 disabled:opacity-60"
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
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={item}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {avatarInitials.map((initials, i) => (
                <div
                  key={initials}
                  className={`w-8 h-8 rounded-full ${avatarColors[i]} flex items-center justify-center text-[10px] font-bold text-on-primary ring-2 ring-surface`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-on-surface-variant">
              Join{" "}
              <span className="font-semibold text-primary">
                <AnimatedCounter target={PRELAUNCH.socialProofCount} suffix="+" />
              </span>{" "}
              {PRELAUNCH.socialProofText}
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6 text-outline" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
