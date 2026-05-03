import { create } from "zustand"
import { persist } from "zustand/middleware"
import { UserSummary } from "@/types"
import { authService } from "@/services/authService"

interface AuthState {
  user: UserSummary | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setUser: (user: UserSummary | null) => void
  login: (user: UserSummary, accessToken: string, refreshToken: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
      refreshUser: async () => {
        try {
          const res = await authService.getMe()
          set({ user: res.data })
        } catch (error) {
          console.error("Failed to refresh user", error)
        }
      },
    }),
    {
      name: "easyvote-auth",
    }
  )
)
