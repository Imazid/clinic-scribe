"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorGlowProps = {
  color?: string;
  size?: number;
  className?: string;
};

export function CursorGlow({
  color = "rgba(111,161,194,0.3)",
  size = 520,
  className,
}: CursorGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    setMounted(true);

    const handleMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      x.set(e.clientX - rect.left - size / 2);
      y.set(e.clientY - rect.top - size / 2);
    };

    const rect = parent.getBoundingClientRect();
    x.set(rect.width / 2 - size / 2);
    y.set(rect.height / 2 - size / 2);

    parent.addEventListener("mousemove", handleMove);
    return () => parent.removeEventListener("mousemove", handleMove);
  }, [x, y, size]);

  const style = {
    width: size,
    height: size,
    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
    filter: "blur(40px)",
  } as const;

  if (reduced) {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className ?? ""}`}
        style={style}
      />
    );
  }

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      style={{ x: sx, y: sy, ...style, opacity: mounted ? 1 : 0 }}
      className={`pointer-events-none absolute left-0 top-0 ${className ?? ""}`}
    />
  );
}
