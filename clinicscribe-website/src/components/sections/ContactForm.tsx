"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, Send } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary/30";
const selectClass =
  "w-full appearance-none rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-secondary/30";
const textAreaClass =
  "min-h-36 w-full rounded-2xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary/30";

const contactTopics = [
  "General enquiry",
  "Pilot program",
  "Integrations",
  "Partnerships",
  "Press",
] as const;

interface ContactFormProps {
  source?: string;
}

export function ContactForm({ source = "about-page" }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clinic, setClinic] = useState("");
  const [topic, setTopic] = useState<string>(contactTopics[0]);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setClinic("");
    setTopic(contactTopics[0]);
    setMessage("");
    setHoneypot("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      setFormState("error");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setFormState("error");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Please add a short message.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          clinic: clinic.trim(),
          topic,
          message: message.trim(),
          source,
          website: honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Something went wrong.");
        setFormState("error");
        return;
      }

      resetForm();
      setSuccessMessage(
        data.message || "Thanks. We've received your message and will be in touch."
      );
      setFormState("success");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setFormState("error");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {formState === "success" ? (
        <motion.div
          key="contact-success"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="glass-card rounded-3xl border border-outline-variant/20 p-8 shadow-ambient"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-container">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
          <h3 className="text-2xl font-bold text-primary">Message received</h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant">
            {successMessage}
          </p>
          <button
            type="button"
            onClick={() => {
              setFormState("idle");
              setSuccessMessage("");
            }}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-outline-variant/25 bg-surface-container-lowest px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            Send another message
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="contact-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl border border-outline-variant/20 p-6 shadow-ambient md:p-8"
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
            <label htmlFor="cf-website">Leave this field empty</label>
            <input
              id="cf-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (formState === "error") {
                    setFormState("idle");
                    setErrorMessage("");
                  }
                }}
                className={inputClass}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (formState === "error") {
                    setFormState("idle");
                    setErrorMessage("");
                  }
                }}
                className={inputClass}
                placeholder="you@clinic.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Clinic or practice
              </label>
              <input
                type="text"
                value={clinic}
                onChange={(event) => setClinic(event.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">
                Topic
              </label>
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className={selectClass}
              >
                {contactTopics.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-primary">
              Message
            </label>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (formState === "error") {
                  setFormState("idle");
                  setErrorMessage("");
                }
              }}
              className={textAreaClass}
              placeholder="Tell us about your practice, workflow, pilot interest, or integration needs."
              required
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-on-surface-variant">
              We use this inbox for demos, pilot enquiries, partnerships, and
              workflow questions.
            </p>
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-6 py-3.5 text-sm font-semibold text-on-primary transition-all hover:shadow-ambient-lg hover:opacity-95 disabled:opacity-60"
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send message
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {formState === "error" && errorMessage ? (
            <p className="mt-4 text-sm text-error">{errorMessage}</p>
          ) : null}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
