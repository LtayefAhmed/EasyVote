import { api } from "@/lib/api"
import { 
  RegisterRequest, 
  LoginRequest, 
  OtpVerifyRequest, 
  AuthResponse, 
  RegisterResponse,
  ApiResponse,
  UserSummary
} from "@/types"

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await api.post("/auth/register", data)
    return response.data
  },

  verifyOtp: async (data: OtpVerifyRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/verify-otp", data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/login", data)
    return response.data
  },

  resendOtp: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post("/auth/resend-otp", { email })
    return response.data
  },

  getMe: async (): Promise<ApiResponse<UserSummary>> => {
    const response = await api.get("/auth/me")
    return response.data
  },

  getAllUsers: async (): Promise<ApiResponse<UserSummary[]>> => {
    const response = await api.get("/admin/users")
    return response.data
  }
}
