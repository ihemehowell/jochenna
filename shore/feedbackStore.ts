import { create } from "zustand";

type FeedbackState = {
  message: string | null;
  pushToast: (message: string) => void;
  clearToast: () => void;
};

export const useFeedbackStore = create<FeedbackState>((set) => ({
  message: null,
  pushToast: (message: string) => set({ message }),
  clearToast: () => set({ message: null }),
}));