"use client";

import { motion } from "framer-motion";
import {
  Stethoscope,
  Heart,
  Pill,
  Activity,
  FileText,
  ShieldCheck,
} from "lucide-react";

const heroElements = [
  { Icon: Stethoscope, x: "8%", y: "18%", size: 24, opacity: 0.05, duration: 6, delay: 0 },
  { Icon: Heart, x: "82%", y: "12%", size: 20, opacity: 0.04, duration: 7, delay: 1 },
  { Icon: Pill, x: "68%", y: "72%", size: 18, opacity: 0.04, duration: 5.5, delay: 0.5 },
  { Icon: Activity, x: "15%", y: "76%", size: 22, opacity: 0.05, duration: 8, delay: 2 },
  { Icon: FileText, x: "90%", y: "45%", size: 20, opacity: 0.03, duration: 6.5, delay: 1.5 },
  { Icon: ShieldCheck, x: "40%", y: "8%", size: 18, opacity: 0.04, duration: 7.5, delay: 0.8 },
  { Icon: null, x: "50%", y: "30%", size: 60, opacity: 0.03, duration: 9, delay: 0, color: "var(--color-secondary-fixed)" },
  { Icon: null, x: "75%", y: "60%", size: 40, opacity: 0.04, duration: 7, delay: 2, color: "var(--color-primary)" },
  { Icon: null, x: "20%", y: "50%", size: 50, opacity: 0.03, duration: 8, delay: 1, color: "var(--color-secondary-container)" },
];

const ctaElements = [
  { Icon: Stethoscope, x: "10%", y: "20%", size: 22, opacity: 0.08, duration: 6, delay: 0 },
  { Icon: Heart, x: "85%", y: "15%", size: 18, opacity: 0.06, duration: 7, delay: 1 },
  { Icon: Activity, x: "70%", y: "75%", size: 20, opacity: 0.07, duration: 5.5, delay: 0.5 },
  { Icon: FileText, x: "25%", y: "70%", size: 18, opacity: 0.06, duration: 8, delay: 2 },
  { Icon: null, x: "55%", y: "35%", size: 50, opacity: 0.04, duration: 9, delay: 0, color: "rgba(255,255,255,0.1)" },
  { Icon: null, x: "30%", y: "55%", size: 35, opacity: 0.05, duration: 7, delay: 1.5, color: "rgba(255,255,255,0.08)" },
];

interface FloatingElementsProps {
  variant?: "hero" | "cta";
}

export function FloatingElements({ variant = "hero" }: FloatingElementsProps) {
  const elements = variant === "hero" ? heroElements : ctaElements;
  const iconColor = variant === "hero" ? "text-primary" : "text-on-primary";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: el.x, top: el.y, opacity: el.opacity }}
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: el.delay,
          }}
        >
          {el.Icon ? (
            <el.Icon className={`${iconColor}`} style={{ width: el.size, height: el.size }} />
          ) : (
            <div
              className="rounded-full"
              style={{
                width: el.size,
                height: el.size,
                background: el.color,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
