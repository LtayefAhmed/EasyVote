// pages/admin/components/Sidebar.tsx
import { LayoutDashboard, Vote, Users, CheckSquare, Award, BarChart2, Settings, LogOut, Sun, Moon, Globe } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { LanguageContext, useTranslation } from "@/i18n"
import { useContext, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Section = "overview" | "votes" | "students" | "voters" | "delegates" | "results" | "settings"

const NAV_ITEMS: { id: Section; icon: React.ComponentType<any>; labelKey: string }[] = [
    { id: "overview", icon: LayoutDashboard, labelKey: "admin.overview" },
    { id: "votes", icon: Vote, labelKey: "admin.votes" },
    { id: "students", icon: Users, labelKey: "admin.students" },
    { id: "voters", icon: CheckSquare, labelKey: "admin.voters" },
    { id: "delegates", icon: Award, labelKey: "admin.delegates" },
    { id: "results", icon: BarChart2, labelKey: "admin.results" },
    { id: "settings", icon: Settings, labelKey: "admin.settings" },
]

interface SidebarProps {
    active: Section
    onActiveChange: (section: Section) => void
    isMobileOpen: boolean
    onMobileClose: () => void
}

export function Sidebar({ active, onActiveChange, isMobileOpen, onMobileClose }: SidebarProps) {
    const { user, logout } = useAuthStore()
    const { language: currentLanguage, setLanguage } = useContext(LanguageContext);
    const navigate = useNavigate()
    const [showLangMenu, setShowLangMenu] = useState(false)
    const { t, language } = useTranslation();
    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const languages = [
        { code: "fr", label: "Français", flag: "🇫🇷" },
        { code: "en", label: "English", flag: "🇺🇸" },
    ]

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <Vote className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            EasyVote
                        </p>
                        <p className="text-[10px] text-gray-400">{t("admin.admin_panel")}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ id, icon: Icon, labelKey }) => (
                    <button
                        key={id}
                        onClick={() => {
                            onActiveChange(id)
                            onMobileClose()
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${active === id
                            ? "bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 text-pink-600 dark:text-pink-400 font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{t(labelKey)}</span>
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                {/* Theme Toggle */}
                <button
                    onClick={() => {
                        const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark"
                        document.documentElement.classList.toggle("dark", newTheme === "dark")
                        localStorage.setItem("theme", newTheme)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                    {document.documentElement.classList.contains("dark") ? (
                        <><Sun className="w-4 h-4" /> {t("admin.light_mode")}</>
                    ) : (
                        <><Moon className="w-4 h-4" /> {t("admin.dark_mode")}</>
                    )}
                </button>

                {/* Language Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{language === "fr" ? "Français" : "English"}</span>
                    </button>
                    <AnimatePresence>
                        {showLangMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as "fr" | "en")
                                            setShowLangMenu(false)
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${language === lang.code
                                            ? "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2 pt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {user?.fullName?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                            {user?.fullName || "Admin"}
                        </p>
                        <p className="text-[10px] text-green-500">● {t("admin.online")}</p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                    <LogOut className="w-4 h-4" />
                    {t("admin.logout")}
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-40 lg:hidden"
                            onClick={onMobileClose}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}