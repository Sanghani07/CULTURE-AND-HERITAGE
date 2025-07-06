import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },
  register: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}

// Financial API
export const financialApi = {
  getAccounts: async () => {
    const response = await apiClient.get('/financial/accounts')
    return response.data
  },
  getTransactions: async (params?: { startDate?: string; endDate?: string; category?: string; limit?: number }) => {
    const response = await apiClient.get('/financial/transactions', { params })
    return response.data
  },
  getSpendingAnalysis: async (period?: string) => {
    const response = await apiClient.get('/financial/spending-analysis', { params: { period } })
    return response.data
  },
  getInvestments: async () => {
    const response = await apiClient.get('/financial/investments')
    return response.data
  },
  getGoals: async () => {
    const response = await apiClient.get('/financial/goals')
    return response.data
  },
  createGoal: async (goalData: { name: string; targetAmount: number; targetDate: string; category: string }) => {
    const response = await apiClient.post('/financial/goals', goalData)
    return response.data
  },
  getHealthScore: async () => {
    const response = await apiClient.get('/financial/health-score')
    return response.data
  },
}

// Assistant API
export const assistantApi = {
  ask: async (question: string) => {
    const response = await apiClient.post('/assistant/ask', { question })
    return response.data
  },
  getInsights: async () => {
    const response = await apiClient.get('/assistant/insights')
    return response.data
  },
  getRecommendations: async () => {
    const response = await apiClient.get('/assistant/recommendations')
    return response.data
  },
  getSummary: async () => {
    const response = await apiClient.get('/assistant/summary')
    return response.data
  },
}