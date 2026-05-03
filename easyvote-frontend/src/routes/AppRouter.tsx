import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Role } from "@/types";
import { motion } from "framer-motion";

// Layout (always loaded)
import DashboardLayout from "@/components/layout/DashboardLayout";

// Public Pages (always loaded - entry points)
import HomePage from "@/pages/public/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import OtpVerifyPage from "@/pages/auth/OtpVerifyPage";

// Protected Pages — LAZY LOADED for performance
const DashboardPage = lazy(() => import("@/pages/student/DashboardPage"));
const ElectionsListPage = lazy(() => import("@/pages/student/ElectionsListPage"));
const ElectionDetailPage = lazy(() => import("@/pages/student/ElectionDetailPage"));
const CandidateProfilePage = lazy(() => import("@/pages/student/CandidateProfilePage"));
const VotePage = lazy(() => import("@/pages/student/VotePage"));
const ResultsPage = lazy(() => import("@/pages/student/ResultsPage"));
const MyVotesPage = lazy(() => import("@/pages/student/MyVotesPage"));
const MyCampaignPage = lazy(() => import("@/pages/candidate/MyCampaignPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const ManageElectionsPage = lazy(() => import("@/pages/admin/ManageElectionsPage"));
const ManageStudentsPage = lazy(() => import("@/pages/admin/ManageStudentsPage"));
const ManageCandidatesPage = lazy(() => import("@/pages/admin/ManageCandidatesPage"));

// Minimal loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
    </div>
  );
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function NotFoundPage() {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-5xl font-black mb-4">404</h1>
      <p className="text-foreground/60">Page introuvable</p>
    </motion.div>
  );
}

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout />;
};

const RoleRoute = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const user = useAuthStore(s => s.user);
  
  if (!user || !allowedRoles.includes(user.role)) {
    setTimeout(() => toast.error("Accès non autorisé"), 0);
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

const router = createBrowserRouter([
  // Routes publiques
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-otp", element: <OtpVerifyPage /> },

  // Routes protégées avec layout
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "dashboard", element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },
      { path: "elections", element: <SuspenseWrap><ElectionsListPage /></SuspenseWrap> },
      { path: "elections/:id", element: <SuspenseWrap><ElectionDetailPage /></SuspenseWrap> },
      { path: "elections/:id/results", element: <SuspenseWrap><ResultsPage /></SuspenseWrap> },
      { path: "candidates/:id", element: <SuspenseWrap><CandidateProfilePage /></SuspenseWrap> },
      
      // STUDENT + CANDIDATE Only
      {
        element: <RoleRoute allowedRoles={["STUDENT", "CANDIDATE"]} />,
        children: [
          { path: "elections/:id/vote", element: <SuspenseWrap><VotePage /></SuspenseWrap> },
          { path: "my-votes", element: <SuspenseWrap><MyVotesPage /></SuspenseWrap> },
        ]
      },
      
      // CANDIDATE Only
      {
        element: <RoleRoute allowedRoles={["CANDIDATE"]} />,
        children: [
          { path: "my-campaign", element: <SuspenseWrap><MyCampaignPage /></SuspenseWrap> },
        ]
      },

      // ADMIN Only
      {
        path: "admin",
        element: <RoleRoute allowedRoles={["ADMIN"]} />,
        children: [
          { index: true, element: <SuspenseWrap><AdminDashboard /></SuspenseWrap> },
          { path: "elections", element: <SuspenseWrap><ManageElectionsPage /></SuspenseWrap> },
          { path: "students", element: <SuspenseWrap><ManageStudentsPage /></SuspenseWrap> },
          { path: "candidates", element: <SuspenseWrap><ManageCandidatesPage /></SuspenseWrap> },
        ]
      }
    ]
  },

  // Catch-all 404
  { path: "*", element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
