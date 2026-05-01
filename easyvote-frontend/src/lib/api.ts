import axios from "axios"
import { API_BASE_URL } from "./constants"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor: Inject Authorization Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: Handle 401 & auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Prevent infinite loop if the refresh token call itself fails
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }
        
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken
        
        localStorage.setItem("accessToken", newToken)
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken)
        }
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
