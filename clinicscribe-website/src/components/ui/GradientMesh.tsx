"use client";

import { motion } from "framer-motion";

const blobs = [
  {
    color: "radial-gradient(circle, rgba(47, 90, 122, 0.08) 0%, transparent 70%)",
    size: 500,
    x: ["0%", "5%", "-3%"],
    y: ["0%", "-4%", "3%"],
    duration: 20,
  },
  {
    color: "radial-gradient(circle, rgba(46, 154, 147, 0.06) 0%, transparent 70%)",
    size: 450,
    x: ["60%", "55%", "65%"],
    y: ["10%", "15%", "5%"],
    duration: 25,
  },
  {
    color: "radial-gradient(circle, rgba(228, 238, 245, 0.2) 0%, transparent 70%)",
    size: 400,
    x: ["30%", "35%", "25%"],
    y: ["50%", "45%", "55%"],
    duration: 18,
  },
  {
    color: "radial-gradient(circle, rgba(58, 46, 34, 0.04) 0%, transparent 70%)",
    size: 350,
    x: ["80%", "75%", "85%"],
    y: ["60%", "55%", "65%"],
    duration: 22,
  },
];

export function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute will-change-transform"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
          }}
          animate={{
            left: blob.x,
            top: blob.y,
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
