import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, LogOut, CheckCheck, Vote, Megaphone, MessageCircle, HelpCircle, BarChart3, UserCheck, Sparkles, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "@/hooks/useTheme";

// ── Notification icon by type ──
const notifIcons: Record<string, typeof Bell> = {
  CAMPAIGN_STARTED: Megaphone,
  VOTE_STARTED: Vote,
  VOTE_ENDED: Vote,
  CANDIDATE_VALIDATED: UserCheck,
  NEW_COMMENT: MessageCircle,
  NEW_QUESTION: HelpCircle,
  QUESTION_ANSWERED: Sparkles,
  RESULTS_PUBLISHED: BarChart3,
}

const notifColors: Record<string, string> = {
  CAMPAIGN_STARTED: "from-indigo-500 to-blue-500",
  VOTE_STARTED: "from-green-500 to-emerald-500",
  VOTE_ENDED: "from-orange-500 to-red-500",
  CANDIDATE_VALIDATED: "from-violet-500 to-purple-500",
  NEW_COMMENT: "from-blue-500 to-cyan-500",
  NEW_QUESTION: "from-yellow-500 to-amber-500",
  QUESTION_ANSWERED: "from-pink-500 to-rose-500",
  RESULTS_PUBLISHED: "from-purple-500 to-pink-500",
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  // Breadcrumb generation based on pathname
  const pathParts = location.pathname.split("/").filter(Boolean);
  let breadcrumb = "Tableau de bord";
  if (pathParts.length > 0) {
    const first = pathParts[0];
    if (first === "dashboard") breadcrumb = "Tableau de bord";
    else if (first === "elections") breadcrumb = "Élections";
    else if (first === "my-votes") breadcrumb = "Mes votes";
    else if (first === "my-campaign") breadcrumb = "Ma campagne";
    else if (first === "admin") {
       if (pathParts[1] === "elections") breadcrumb = "Gérer les élections";
       else if (pathParts[1] === "students") breadcrumb = "Gestion Étudiants";
       else if (pathParts[1] === "candidates") breadcrumb = "Gestion Candidatures";
       else breadcrumb = "Admin Dashboard";
    }
  }

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-background/40 backdrop-blur-xl border-b border-white/10 z-30 transition-colors shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-foreground/70 hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold tracking-tight">{breadcrumb}</h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-foreground/50" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="h-9 w-64 rounded-full bg-white/5 border border-transparent focus:border-indigo-500/50 focus:bg-background pl-9 pr-4 text-sm outline-none transition-all"
          />
        </div>

        {/* ═══ Notifications Popover ═══ */}
        <Popover>
          <PopoverTrigger className="relative p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer outline-none border-none bg-transparent flex items-center justify-center">
            <Bell className="w-5 h-5 text-foreground/70" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0 bg-background/95 backdrop-blur-xl border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h4 className="font-semibold text-sm">Notifications</h4>
                <p className="text-xs text-foreground/50">
                  {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est à jour ✓"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Tout marquer
                </button>
              )}
            </div>

            {/* Notifications list */}
            <ScrollArea className="max-h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bell className="w-10 h-10 mx-auto mb-3 text-foreground/20" />
                  <p className="text-sm text-foreground/50">Aucune notification</p>
                  <p className="text-xs text-foreground/30 mt-1">Vous serez prévenu des événements importants</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notif, i) => {
                    const Icon = notifIcons[notif.type] || Bell
                    const colorGradient = notifColors[notif.type] || "from-gray-500 to-gray-600"
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id)
                          if (notif.link) navigate(notif.link)
                        }}
                        className={`group flex gap-3 p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/[0.03] ${!notif.read ? "bg-white/[0.02]" : ""}`}
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className={`text-sm ${!notif.read ? "font-bold" : "font-medium"} text-foreground`}>
                              {notif.title}
                            </h5>
                            {!notif.read && (
                              <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-indigo-400" />
                            )}
                          </div>
                          <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{notif.content}</p>
                          <p className="text-[10px] text-foreground/40 mt-2">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 ml-1 cursor-pointer border-none bg-transparent flex items-center justify-center p-0">
            <Avatar className="bg-gradient-to-br from-indigo-500 to-purple-500 h-9 w-9">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border-border rounded-xl shadow-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user?.fullName}</span>
                    <span className="text-xs text-foreground/50 truncate max-w-[150px]">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    user?.role === "ADMIN" ? "bg-red-400" : 
                    user?.role === "CANDIDATE" ? "bg-violet-400" : 
                    "bg-blue-400"
                  } animate-pulse`} />
                  <span className="text-foreground/70">Connecté en tant que</span>
                  <span className="font-bold text-foreground">{user?.role}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer focus:bg-foreground/5 rounded-lg">
              {theme === "dark" ? (
                <><Sun className="w-4 h-4 mr-2" />Mode clair</>
              ) : (
                <><Moon className="w-4 h-4 mr-2" />Mode sombre</>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-400/10 rounded-lg">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
