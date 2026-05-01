import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Role } from "@/types"
import HomePage from "@/pages/public/HomePage"
import { NotFoundPage } from "@/pages/public/NotFoundPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import OtpVerifyPage from "@/pages/auth/OtpVerifyPage"
import { ROUTES } from "@/lib/constants"

// Placeholders for future pages
const DashboardPage = () => <div className="p-10">Dashboard (Protected)</div>

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: Role[] }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}

export const AppRouter = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.VERIFY_OTP} element={<OtpVerifyPage />} />
      
      {/* Protected Routes Example */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
