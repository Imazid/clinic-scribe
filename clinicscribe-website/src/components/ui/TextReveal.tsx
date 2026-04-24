"use client";

import { useEffect, useState, type CSSProperties, type ElementType } from "react";
import { motion, type Variants } from "framer-motion";

export type TextRevealSegment = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

type TextRevealProps = {
  text?: string;
  segments?: TextRevealSegment[];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delay?: number;
  once?: boolean;
};

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export function TextReveal({
  text,
  segments,
  as,
  className,
  style,
  stagger = 0.045,
  delay = 0,
  once = true,
}: TextRevealProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const parts: TextRevealSegment[] = segments ?? (text !== undefined ? [{ text }] : []);

  const Tag = (as ?? "span") as ElementType;

  if (reduced) {
    return (
      <Tag className={className} style={style}>
        {parts.map((part, i) => (
          <span key={i} className={part.className} style={part.style}>
            {part.text}
          </span>
        ))}
      </Tag>
    );
  }

  const MotionTag = motion.create(Tag);

  let wordIndex = 0;

  return (
    <MotionTag
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      custom={{ stagger, delay }}
    >
      {parts.map((part, pi) => {
        const words = part.text.split(/(\s+)/);
        return (
          <span key={pi} className={part.className} style={part.style}>
            {words.map((word, wi) => {
              if (/^\s+$/.test(word)) {
                return <span key={`${pi}-${wi}`}>{word}</span>;
              }
              wordIndex += 1;
              return (
                <span key={`${pi}-${wi}`} style={{ display: "inline-block", overflow: "hidden" }}>
                  <motion.span
                    style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
                    variants={wordVariants}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
      {/* suppress lint: wordIndex retained for potential future per-word offset */}
      <span hidden>{wordIndex}</span>
    </MotionTag>
  );
}
