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

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 280, damping: 26, mass: 0.5 });
  const ringY = useSpring(dotY, { stiffness: 280, damping: 26, mass: 0.5 });

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
      dotX.set(e.clientX);
      dotY.set(e.clientY);
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
  }, [enabled, dotX, dotY, visible]);

  if (!enabled) return null;

  const ringSize = state === "hover" ? 52 : state === "text" ? 4 : 32;
  const ringHeight = state === "text" ? 24 : ringSize;
  const ringOpacity = visible ? 1 : 0;
  const dotOpacity = state === "hover" ? 0 : visible ? 1 : 0;
  const ringBorder =
    state === "hover"
      ? "2px solid #2F5A7A"
      : state === "text"
        ? "2px solid #1F1A14"
        : "1.5px solid rgba(31, 26, 20, 0.55)";
  const ringBackground = state === "hover" ? "rgba(47, 90, 122, 0.08)" : "transparent";
  const ringRadius = state === "text" ? 2 : ringSize;

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          x: dotX,
          y: dotY,
          opacity: dotOpacity,
        }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{
          x: ringX,
          y: ringY,
          opacity: ringOpacity,
        }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringHeight,
            borderRadius: ringRadius,
            border: ringBorder,
            background: ringBackground,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />
      </motion.div>
    </>
  );
}
