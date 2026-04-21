"use client";

import { useEffect, useState } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

interface LiveCountProps {
  fallback: number;
  className?: string;
}

function format(count: number): { value: number; suffix: string } {
  if (count >= 100) {
    return { value: Math.floor(count / 100) * 100, suffix: "+" };
  }
  return { value: count, suffix: "" };
}

export function LiveCount({ fallback, className }: LiveCountProps) {
  const [count, setCount] = useState<number>(fallback);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/waitlist/count", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const { value, suffix } = format(count);
  return <AnimatedCounter target={value} suffix={suffix} className={className} />;
}
