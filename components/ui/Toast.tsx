"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useFeedbackStore } from "@/shore/feedbackStore";

export default function Toast() {
  const message = useFeedbackStore((state) => state.message);
  const clearToast = useFeedbackStore((state) => state.clearToast);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      clearToast();
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [message, clearToast]);

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-gray-900 px-5 py-3 text-sm text-white shadow-lg"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}