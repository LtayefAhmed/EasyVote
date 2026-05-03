import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Vote,
  CheckCircle,
  Megaphone,
  Settings,
  Users,
  UserCheck,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  if (!user) return null;

  const role = user.role;

  // Définir les liens
  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord", roles: ["STUDENT", "CANDIDATE", "ADMIN"] },
    { to: "/elections", icon: Vote, label: "Élections", roles: ["STUDENT", "CANDIDATE", "ADMIN"] },
    { to: "/my-votes", icon: CheckCircle, label: "Mes votes", roles: ["STUDENT", "CANDIDATE"] },
    { to: "/my-campaign", icon: Megaphone, label: "Ma campagne", roles: ["CANDIDATE"] },
    { to: "/admin/elections", icon: Settings, label: "Gérer élections", roles: ["ADMIN"] },
    { to: "/admin/students", icon: Users, label: "Étudiants", roles: ["ADMIN"] },
    { to: "/admin/candidates", icon: UserCheck, label: "Candidatures", roles: ["ADMIN"] },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(role));

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="flex flex-col w-full h-full bg-background/40 backdrop-blur-xl border-r border-white/10 dark:bg-[#0a0613]/80">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
        <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            EasyVote
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              end={link.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 to-violet-500/5 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500"
                    : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-indigo-500 text-white font-semibold">
                {user.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user.fullName}</span>
              <span className="text-xs text-foreground/50">{role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-pink-500 hover:text-pink-600 hover:bg-pink-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
