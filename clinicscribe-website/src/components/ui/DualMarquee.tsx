"use client";

import { useEffect, useState, type ReactNode } from "react";

type DualMarqueeProps = {
  top: ReactNode[];
  bottom?: ReactNode[];
  className?: string;
  gap?: string;
};

export function DualMarquee({
  top,
  bottom,
  className,
  gap = "gap-5",
}: DualMarqueeProps) {
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const bottomItems = bottom ?? top;

  const renderRow = (items: ReactNode[], direction: "ltr" | "rtl") => {
    const doubled = [...items, ...items];
    const trackClass = direction === "ltr" ? "marquee-track" : "marquee-track-reverse";
    return (
      <div className="marquee-fade overflow-hidden">
        <div
          className={`flex items-stretch ${gap} ${reduced ? "overflow-x-auto" : trackClass}`}
          style={reduced ? undefined : { paddingRight: "1.25rem" }}
        >
          {doubled.map((item, i) => (
            <div key={i} aria-hidden={i >= items.length} className="shrink-0">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col gap-5 ${paused ? "marquee-paused" : ""} ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {renderRow(top, "ltr")}
      {renderRow(bottomItems, "rtl")}
    </div>
  );
}
