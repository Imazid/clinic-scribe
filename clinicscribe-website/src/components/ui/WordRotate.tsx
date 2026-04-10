"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WordRotateProps {
  words: readonly string[];
  interval?: number;
  className?: string;
}

export function WordRotate({ words, interval = 3000, className = "" }: WordRotateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className="inline-block relative overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentIndex]}
          initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`inline-block gradient-text ${className}`}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
