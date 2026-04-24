"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type PinnedHorizontalScrollProps = {
  children: ReactNode;
  className?: string;
  slideClassName?: string;
};

export function PinnedHorizontalScroll({
  children,
  className,
  slideClassName,
}: PinnedHorizontalScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrowMq = window.matchMedia("(max-width: 1023px)");
    setReduced(reducedMq.matches);
    setNarrow(narrowMq.matches);
    const onReduced = (e: MediaQueryListEvent) => setReduced(e.matches);
    const onNarrow = (e: MediaQueryListEvent) => setNarrow(e.matches);
    reducedMq.addEventListener("change", onReduced);
    narrowMq.addEventListener("change", onNarrow);
    return () => {
      reducedMq.removeEventListener("change", onReduced);
      narrowMq.removeEventListener("change", onNarrow);
    };
  }, []);

  const slides = Children.toArray(children);
  const count = slides.length;

  const { scrollYProgress } = useScroll({ target: ref });
  const endPct = count > 1 ? ((count - 1) / count) * 100 : 0;
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${endPct}%`]);

  if (reduced || narrow) {
    return (
      <div className={`flex flex-col gap-6 ${className ?? ""}`}>
        {slides.map((slide, i) => (
          <div key={i} className={slideClassName}>
            {slide}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ height: `${count * 100}vh`, position: "relative" }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          style={{ x, width: `${count * 100}%`, willChange: "transform" }}
          className="flex h-full"
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`flex h-full items-center justify-center ${slideClassName ?? ""}`}
              style={{ width: `${100 / count}%` }}
            >
              {slide}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
