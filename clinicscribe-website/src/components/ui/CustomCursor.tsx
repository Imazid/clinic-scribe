"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const HOVER_SELECTOR =
  'a, button, [role="button"], [data-cursor-hover], label[for], summary';
const TEXT_SELECTOR =
  'input[type="text"], input[type="email"], input[type="search"], input[type="url"], input[type="tel"], input[type="password"], input:not([type]), textarea, [contenteditable="true"]';

type CursorState = "default" | "hover" | "text";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 520, damping: 38, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 520, damping: 38, mass: 0.35 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supports =
      window.matchMedia("(hover: hover)").matches &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.innerWidth >= 768;
    setEnabled(supports);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("custom-cursor-active");
    return () => {
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!visible) setVisible(true);

      const target = e.target as Element | null;
      if (!target || target.nodeType !== 1) return;
      if (target.closest(TEXT_SELECTOR)) {
        setState("text");
      } else if (target.closest(HOVER_SELECTOR)) {
        setState("hover");
      } else {
        setState("default");
      }
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [enabled, rawX, rawY, visible]);

  if (!enabled) return null;

  const width = state === "hover" ? 56 : state === "text" ? 3 : 24;
  const height = state === "text" ? 26 : width;
  const radius = state === "text" ? 2 : 9999;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x,
        y,
        opacity: visible ? 1 : 0,
        mixBlendMode: "difference",
      }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div
        animate={{ width, height, borderRadius: radius }}
        transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.4 }}
        style={{ backgroundColor: "#FCF9F4" }}
      />
    </motion.div>
  );
}
