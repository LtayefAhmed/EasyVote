export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8082/api"
export const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8082/ws"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  DASHBOARD: "/dashboard",
  ELECTIONS: "/elections",
  VOTE: "/elections/:id/vote",
  RESULTS: "/elections/:id/results",
  ADMIN: "/admin",
  CANDIDATE: "/candidate",
  STUDENT:"/student"
}

export const APP_NAME = "EasyVote"
