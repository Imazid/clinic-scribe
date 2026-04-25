"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  /** Maximum px of drift end-to-end. Default 220 — generous and visible. */
  range?: number;
}

export function Parallax({
  children,
  speed = 0.3,
  className,
  range = 220,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  const y = useMotionValue(0);
  const smoothY = useSpring(y, { stiffness: 150, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // progress: 0 when element top hits viewport bottom, 1 when bottom hits top
      const total = rect.height + vh;
      const traveled = vh - rect.top;
      const progress = Math.max(0, Math.min(1, traveled / total));
      const drift = range * speed;
      // map 0 → +drift (element below) → 0 (centered) → -drift (above)
      y.set(drift - progress * drift * 2);
    };

    compute();

    let raf = 0;
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(() => {
        pending = false;
        compute();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      cancelAnimationFrame(raf);
    };
  }, [reduced, speed, range, y]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ y: smoothY, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
