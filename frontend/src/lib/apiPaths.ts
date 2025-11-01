// API endpoints configuration
export const API_PATHS = {
  // Base URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",

  // Auth endpoints
  AUTH: {
    LOGIN: "/api/users/login",
    SIGNUP: "/api/users/signup",
    PROFILE: "/api/users",
    LOGOUT: "/api/users/logout",
  },

  // Template endpoints
  TEMPLATES: {
    BASE: "/api/templates",
    GET_ALL: "/api/templates",
    GET_BY_ID: (id: string) => `/api/templates/${id}`,
    CREATE: "/api/templates",
    UPDATE: (id: string) => `/api/templates/${id}`,
    DELETE: (id: string) => `/api/templates/${id}`,
  },

  // API Keys endpoints
  API_KEYS: {
    BASE: "/api/apikeys",
    GET_ALL: "/api/apikeys",
    CREATE: "/api/apikeys",
    REVOKE: (id: string) => `/api/apikeys/${id}/revoke`,
    RESTORE: (id: string) => `/api/apikeys/${id}/restore`,
    DELETE: (id: string) => `/api/apikeys/${id}`,
  },

  // Analytics endpoints
  ANALYTICS: {
    STATS: "/api/analytics/stats",
    LOGS: "/api/analytics/logs",
    REALTIME: "/api/analytics/realtime",
  },
};