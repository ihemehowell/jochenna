"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "pulse" | "shimmer";
}

export default function Skeleton({
  className = "",
  variant = "shimmer",
}: SkeletonProps) {
  if (variant === "pulse") {
    return (
      <motion.div
        className={`bg-hairline rounded ${className}`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-paper via-paper to-paper rounded ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
      }}
    />
  );
}

const styles = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = styles;
  document.head.appendChild(style);
}
