import { create } from "zustand";

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
  updatePlan: (plan: "free" | "pro" | "enterprise") => void;

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
  updatePlan: (plan) => set({ currentPlan: plan }),

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
