import { create } from "zustand";

interface UserStats {
  emailsSent: number;
  templatesCreated: number;
  activeApiKeys: number;
  usageLimit: number;
  usagePercentage: number;
}

interface UserStore {
  stats: UserStats;
  currentPlan: "free" | "pro" | "enterprise";
  updateStats: (stats: Partial<UserStats>) => void;
  updatePlan: (plan: "free" | "pro" | "enterprise") => void;
}

export const useUserStore = create<UserStore>((set) => ({
  stats: {
    emailsSent: 1248,
    templatesCreated: 12,
    activeApiKeys: 3,
    usageLimit: 5000,
    usagePercentage: 24.96,
  },
  currentPlan: "free",
  updateStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),
  updatePlan: (plan) => set({ currentPlan: plan }),
}));
