import { create } from "zustand";
import { authService } from "@/lib/api.service";

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: string;
}

interface Template {
  _id: string;
  name: string;
  slug: string;
  subject: string;
  html: string;
  createdAt: string;
}

interface UsageItem {
  type: "email" | "sms" | "push_notification";
  allowedLimit: number;
  usedLimit: number;
}

interface UserStats {
  emailsSent: number;
  templatesCreated: number;
  activeApiKeys: number;
  usageLimit: number;
  usagePercentage: number;
}

interface UserStore {
  // Stats
  stats: UserStats;
  currentPlan: "free" | "pro" | "enterprise";
  updateStats: (stats: Partial<UserStats>) => void;
  updatePlan: (plan: "free" | "pro" | "enterprise") => Promise<void>;
  loadUserData: () => Promise<void>;

  // Templates
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;

  // API Keys
  apiKeys: ApiKey[];
  setApiKeys: (apiKeys: ApiKey[]) => void;
  addApiKey: (apiKey: ApiKey) => void;
  deleteApiKey: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  // Stats
  stats: {
    emailsSent: 0,
    templatesCreated: 0,
    activeApiKeys: 0,
    usageLimit: 5000,
    usagePercentage: 0,
  },
  currentPlan: "free",
  updateStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),
  updatePlan: async (plan) => {
    try {
      const response = await authService.updateUserPlan(plan);
      if (response.success && response.data) {
        // Update plan and refresh user data with new limits
        set({ currentPlan: plan });
        
        // Update usage limits if available
        if (response.data.usage) {
          const emailUsage = response.data.usage.find((u: UsageItem) => u.type === "email");
          if (emailUsage) {
            set((state) => ({
              stats: {
                ...state.stats,
                usageLimit: emailUsage.allowedLimit,
                usagePercentage: Math.round(
                  (emailUsage.usedLimit / emailUsage.allowedLimit) * 100
                ),
              },
            }));
          }
        }
      }
    } catch (error) {
      console.error("Failed to update plan:", error);
      throw error;
    }
  },
  loadUserData: async () => {
    try {
      const response = await authService.getUserProfile();
      if (response.success && response.data) {
        set({
          currentPlan: response.data.userPlan || "free",
          templates: response.data.templates || [],
          apiKeys: response.data.apiKeys || [],
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  },

  // Templates
  templates: [],
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template],
    })),
  updateTemplate: (id, updatedTemplate) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t._id === id ? { ...t, ...updatedTemplate } : t
      ),
    })),
  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t._id !== id),
    })),

  // API Keys
  apiKeys: [],
  setApiKeys: (apiKeys) => set({ apiKeys }),
  addApiKey: (apiKey) =>
    set((state) => ({
      apiKeys: [...state.apiKeys, apiKey],
    })),
  deleteApiKey: (id) =>
    set((state) => ({
      apiKeys: state.apiKeys.filter((k) => k._id !== id),
    })),
}));
