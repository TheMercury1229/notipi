import { axiosInstance } from "./axios";
import { API_PATHS } from "./apiPaths";

// ============= Auth Services =============
export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  signup: async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post(API_PATHS.AUTH.SIGNUP, {
      name,
      email,
      password,
    });
    return response.data;
  },

  getUserProfile: async () => {
    const response = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
    return response.data;
  },

  updateUserPlan: async (plan: "free" | "pro" | "enterprise") => {
    const response = await axiosInstance.patch(API_PATHS.AUTH.UPDATE_PLAN, {
      plan,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
    return response.data;
  },
};

// ============= Template Services =============
export const templateService = {
  // Fetch all templates for the user
  getAllTemplates: async () => {
    const response = await axiosInstance.get(API_PATHS.TEMPLATES.GET_ALL);
    return response.data;
  },

  // Fetch all public templates
  getPublicTemplates: async () => {
    const response = await axiosInstance.get(
      `${API_PATHS.TEMPLATES.BASE}/all`
    );
    return response.data;
  },

  // Fetch template by ID
  getTemplateById: async (id: string) => {
    const response = await axiosInstance.get(
      API_PATHS.TEMPLATES.GET_BY_ID(id)
    );
    return response.data;
  },

  // Fetch template by slug
  getTemplateBySlug: async (slug: string) => {
    const response = await axiosInstance.get(
      `${API_PATHS.TEMPLATES.BASE}/slug/${slug}`
    );
    return response.data;
  },

  // Create new template
  createTemplate: async (data: {
    name: string;
    content: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    const response = await axiosInstance.post(
      API_PATHS.TEMPLATES.CREATE,
      data
    );
    return response.data;
  },

  // Create template with AI
  createTemplateWithAI: async (prompt: string) => {
    const response = await axiosInstance.post(
      `${API_PATHS.TEMPLATES.BASE}/generate-ai`,
      { prompt }
    );
    return response.data;
  },

  // Update template
  updateTemplate: async (
    id: string,
    data: {
      name?: string;
      content?: string;
      description?: string;
      isPublic?: boolean;
    }
  ) => {
    const response = await axiosInstance.patch(
      API_PATHS.TEMPLATES.UPDATE(id),
      data
    );
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    const response = await axiosInstance.delete(
      API_PATHS.TEMPLATES.DELETE(id)
    );
    return response.data;
  },
};

// ============= API Key Services =============
export const apiKeyService = {
  // Fetch all API keys
  getAllApiKeys: async () => {
    const response = await axiosInstance.get(API_PATHS.API_KEYS.GET_ALL);
    return response.data;
  },

  // Fetch single API key by ID
  getApiKeyById: async (id: string) => {
    const response = await axiosInstance.get(`${API_PATHS.API_KEYS.BASE}/${id}`);
    return response.data;
  },

  // Create new API key
  createApiKey: async (name: string) => {
    const response = await axiosInstance.post(API_PATHS.API_KEYS.CREATE, {
      name,
    });
    return response.data;
  },

  // Update API key
  updateApiKey: async (id: string, name: string) => {
    const response = await axiosInstance.patch(
      `${API_PATHS.API_KEYS.BASE}/${id}`,
      { name }
    );
    return response.data;
  },

  // Revoke API key
  revokeApiKey: async (id: string) => {
    const response = await axiosInstance.post(API_PATHS.API_KEYS.REVOKE(id));
    return response.data;
  },

  // Restore (un-revoke) API key
  restoreApiKey: async (id: string) => {
    const response = await axiosInstance.post(API_PATHS.API_KEYS.RESTORE(id));
    return response.data;
  },

  // Delete API key
  deleteApiKey: async (id: string) => {
    const response = await axiosInstance.delete(
      API_PATHS.API_KEYS.DELETE(id)
    );
    return response.data;
  },
};

// ============= Analytics Services =============
export const analyticsService = {
  // Get comprehensive analytics stats
  getStats: async () => {
    const response = await axiosInstance.get(API_PATHS.ANALYTICS.STATS);
    return response.data;
  },

  // Get activity logs with filtering
  getLogs: async (params?: {
    type?: string;
    status?: string;
    limit?: number;
    skip?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await axiosInstance.get(API_PATHS.ANALYTICS.LOGS, {
      params,
    });
    return response.data;
  },

  // Get real-time stats for dashboard
  getRealTimeStats: async () => {
    const response = await axiosInstance.get(API_PATHS.ANALYTICS.REALTIME);
    return response.data;
  },
};