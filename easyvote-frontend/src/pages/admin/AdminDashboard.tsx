import { Navigate } from "react-router-dom"

// Admin uses the same unified dashboard as all roles
export default function AdminDashboard() {
  return <Navigate to="/dashboard" replace />
}
