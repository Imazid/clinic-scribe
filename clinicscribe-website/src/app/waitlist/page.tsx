import type { Metadata } from "next";
import { Sparkles, MessageSquareHeart, Rocket, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BRAND, PRELAUNCH, EARLY_ACCESS_BENEFITS } from "@/lib/constants";
import { GradientMesh } from "@/components/ui/GradientMesh";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { WaitlistForm } from "@/components/sections/WaitlistForm";

export const metadata: Metadata = {
  title: `Join the waitlist · ${BRAND.name}`,
  description:
    "Be first in line when Miraa opens. Waitlist members get launch updates, priority onboarding, and the 14-day free trial.",
  alternates: { canonical: "/waitlist" },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  MessageSquareHeart,
  Rocket,
};

const avatarInitials = ["DS", "JK", "AM", "RL"];
const avatarColors = [
  "bg-secondary",
  "bg-primary-container",
  "bg-secondary-fixed-dim",
  "bg-primary",
];

export default function WaitlistPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface pt-32 pb-24">
      <GradientMesh />

      <div className="relative mx-auto max-w-[860px] px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        <div className="mt-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-1.5 text-xs font-semibold tracking-wide text-[#1E3D55]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
            </span>
            Waitlist · launching soon
          </span>

          <h1
            className="mt-7 font-bold tracking-[-0.035em] text-primary leading-[1.05]"
            style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
          >
            Be first when{" "}
            <span
              className="font-display italic font-normal"
              style={{
                background: "linear-gradient(92deg, #2F5A7A 20%, #6FA1C2 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Miraa
            </span>{" "}
            opens.
          </h1>

          <p
            className="mt-6 mx-auto text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-[620px]"
            style={{ textWrap: "pretty" }}
          >
            Drop your details below. We&rsquo;ll email you the moment the app
            goes live and your 14-day free trial is ready to start.
          </p>
        </div>

        <div className="mt-12">
          <WaitlistForm source="waitlist_page" />
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
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
        </div>

        <div className="mt-20">
          <div className="text-center">
            <span className="label-text text-secondary">What you get</span>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-primary">
              Why join the waitlist
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {EARLY_ACCESS_BENEFITS.map((benefit) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10">
                    {Icon && <Icon className="h-5 w-5 text-secondary" />}
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          We email launch news only. No spam, unsubscribe any time.
        </div>
      </div>
    </main>
  );
}
