"use client";

import { useEffect } from "react";

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

  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-gray-900 px-5 py-3 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}