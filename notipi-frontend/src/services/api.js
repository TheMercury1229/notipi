import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get Clerk token
      const token = await window.Clerk?.session?.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting token:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response.data, // Return only data
  (error) => {
    const message = error.response?.data?.message || error.message
    console.error('API Error:', message, error.response)
    return Promise.reject(error)
  }
)

// User API
export const userAPI = {
  authCallback: async (clerkId) => {
    try {
      const response = await api.post('/api/users/auth/callback', { clerkId })
      return response.data || response
    } catch (error) {
      console.error('Auth callback error:', error)
      throw error
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/')
      return response.data || response
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },
}

// API Keys API
export const apiKeysAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/apikeys/')
      return response.data || response
    } catch (error) {
      console.error('Get API keys error:', error)
      return [] // Return empty array on error
    }
  },
  
  create: async (data) => {
    const response = await api.post('/api/apikeys/', data)
    return response.data || response
  },
  
  update: async (id, data) => {
    const response = await api.patch(`/api/apikeys/${id}`, data)
    return response.data || response
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/apikeys/${id}`)
    return response.data || response
  },
}

// Templates API
export const templatesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/templates/')
      return response.data || response
    } catch (error) {
      console.error('Get templates error:', error)
      return [] // Return empty array on error
    }
  },
  
  create: async (data) => {
    const response = await api.post('/api/templates/', data)
    return response.data || response
  },
  
  update: async (id, data) => {
    const response = await api.patch(`/api/templates/${id}`, data)
    return response.data || response
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/templates/${id}`)
    return response.data || response
  },
}

export default api
