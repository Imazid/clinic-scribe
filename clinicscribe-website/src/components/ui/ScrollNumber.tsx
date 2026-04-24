"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";

type ScrollNumberProps = {
  from?: number;
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  style?: CSSProperties;
};

export function ScrollNumber({
  from = 0,
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
  style,
}: ScrollNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState(false);
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "center 50%"],
  });

  const numeric = useTransform(scrollYProgress, [0, 1], [from, to]);

  useMotionValueEvent(numeric, "change", (latest) => {
    setValue(latest);
  });

  const displayed = reduced ? to : value;
  const formatted =
    decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed).toString();

  return (
    <motion.span ref={ref} className={className} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </motion.span>
  );
}
