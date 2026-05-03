// pages/candidate/CandidateDashboard.tsx
import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard, User, Megaphone, BarChart3, Users, MessageSquare,
    Settings, LogOut, Sun, Moon, Globe, Bell, ChevronRight, Award,
    TrendingUp, Heart, Share2, Calendar, Clock, CheckCircle, XCircle,
    Image,
    FileText,
    Video,
    Trophy,
    Menu
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { LanguageContext, useTranslation } from "@/i18n"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

type Section = "overview" | "profile" | "campaign" | "analytics" | "supporters" | "messages"

// Mock data for candidate
const candidateData = {
    id: "1",
    name: "Emma Laurent",
    role: "Déléguée L3 Informatique",
    program: "Informatique",
    bio: "Engagée pour l'innovation pédagogique et l'égalité des chances. Ma vision : une université plus connectée, inclusive et durable.",
    programDetails: "Création d'espaces de coworking, amélioration du WiFi sur tout le campus, organisation de hackathons mensuels, mise en place d'un système de mentorat entre étudiants.",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    coverPhoto: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    votes: 3247,
    ranking: 1,
    percentage: 34,
    status: "approved",
    delegates: [
        { id: 1, name: "Thomas Dubois", votes: 2890, percentage: 30 },
        { id: 2, name: "Sarah Benali", votes: 2356, percentage: 25 },
        { id: 3, name: "Marc Chen", votes: 1150, percentage: 12 }
    ],
    recentVotes: [
        { id: "#V8821", student: "Alice L.", time: "Il y a 2 min", department: "Informatique" },
        { id: "#V8820", student: "Thomas B.", time: "Il y a 5 min", department: "Droit" },
        { id: "#V8819", student: "Sofia C.", time: "Il y a 12 min", department: "Médecine" }
    ],
    supporters: [
        { id: 1, name: "Prof. Marie Lambert", role: "Directrice du département", message: "Une candidate exceptionnelle !", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
        { id: 2, name: "Dr. Pierre Martin", role: "Responsable pédagogique", message: "Je soutiens son programme innovant", avatar: "https://randomuser.me/api/portraits/men/2.jpg" }
    ],
    messages: [
        { id: 1, from: "Étudiant Anonyme", message: "Bravo pour votre programme !", time: "Il y a 1h", read: false },
        { id: 2, from: "Sarah L.", message: "Je soutiens votre candidature", time: "Il y a 3h", read: true }
    ]
}

// Components
function CandidateStatCard({ label, value, icon, trend, color }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {trend && <p className="text-xs text-green-500 mt-1">{trend}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    )
}

function Sidebar({ active, onActiveChange, isMobileOpen, onMobileClose }: any) {
    const { language: currentLanguage, setLanguage } = useContext(LanguageContext);
    const { t, language } = useTranslation();
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const [showLangMenu, setShowLangMenu] = useState(false)

    const navItems = [
        { id: "overview", icon: LayoutDashboard, label: t("candidate.overview") },
        { id: "profile", icon: User, label: t("candidate.profile") },
        { id: "campaign", icon: Megaphone, label: t("candidate.campaign") },
        { id: "analytics", icon: BarChart3, label: t("candidate.analytics") },
        { id: "supporters", icon: Users, label: t("candidate.supporters") },
        { id: "messages", icon: MessageSquare, label: t("candidate.messages") },
    ]

    const languages = [
        { code: "fr", label: "Français", flag: "🇫🇷" },
        { code: "en", label: "English", flag: "🇺🇸" },
    ]

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const SidebarContent = () => (
        <>
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            EasyVote
                        </p>
                        <p className="text-[10px] text-gray-400">{t("candidate.candidate_space")}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => {
                            onActiveChange(id)
                            onMobileClose()
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${active === id
                                ? "bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 text-pink-600 dark:text-pink-400 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <button
                    onClick={() => {
                        const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark"
                        document.documentElement.classList.toggle("dark", newTheme === "dark")
                        localStorage.setItem("theme", newTheme)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                    {document.documentElement.classList.contains("dark") ? (
                        <><Sun className="w-4 h-4" /> {t("candidate.light_mode")}</>
                    ) : (
                        <><Moon className="w-4 h-4" /> {t("candidate.dark_mode")}</>
                    )}
                </button>

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
                                className="absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden"
                            >
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as "fr" | "en")
                                            setShowLangMenu(false)
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${language === lang.code
                                                ? "bg-pink-50 dark:bg-pink-950/20 text-pink-600"
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

                <div className="flex items-center gap-2 pt-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={candidateData.photo} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                            {candidateData.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                            {candidateData.name}
                        </p>
                        <p className="text-[10px] text-green-500">● {t("candidate.online")}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                    <LogOut className="w-4 h-4" />
                    {t("candidate.logout")}
                </button>
            </div>
        </>
    )

    return (
        <>
            <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0">
                <SidebarContent />
            </aside>

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
                            className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-white dark:bg-gray-900 border-r flex flex-col lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

function MobileHeader({ isOpen, onToggle, title }: any) {
    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        EasyVote
                    </span>
                </div>
                <button onClick={onToggle} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {isOpen ? <XCircle className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
        </div>
    )
}

// Sections
function OverviewSection() {
    const { t } = useTranslation()

    return (
        <div>
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 to-purple-600/80 z-10" />
                <img src={candidateData.coverPhoto} alt="Cover" className="w-full h-48 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20 border-4 border-white shadow-xl">
                            <AvatarImage src={candidateData.photo} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl">
                                {candidateData.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-white">
                            <h1 className="text-2xl font-bold">{candidateData.name}</h1>
                            <p className="text-white/90">{candidateData.role}</p>
                            <Badge className="mt-1 bg-green-500/20 text-green-100 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" /> {t("candidate.candidature_approved")}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <CandidateStatCard
                    label={t("candidate.current_ranking")}
                    value={`#${candidateData.ranking}`}
                    icon={<Trophy className="w-5 h-5 text-white" />}
                    color="from-amber-500 to-orange-500"
                />
                <CandidateStatCard
                    label={t("candidate.total_votes")}
                    value={candidateData.votes.toLocaleString()}
                    trend={`${candidateData.percentage}% ${t("candidate.of_total")}`}
                    icon={<TrendingUp className="w-5 h-5 text-white" />}
                    color="from-pink-500 to-rose-500"
                />
                <CandidateStatCard
                    label={t("candidate.supporters")}
                    value={candidateData.supporters.length}
                    icon={<Heart className="w-5 h-5 text-white" />}
                    color="from-red-500 to-rose-500"
                />
                <CandidateStatCard
                    label={t("candidate.campaign_progress")}
                    value="78%"
                    icon={<Calendar className="w-5 h-5 text-white" />}
                    color="from-emerald-500 to-teal-500"
                />
            </div>

            {/* Progress and Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Campaign Progress */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <Megaphone className="w-4 h-4" /> {t("candidate.campaign_progress_title")}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">{t("candidate.goal_reached")}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">78%</span>
                            </div>
                            <Progress value={78} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-pink-600">5/12</p>
                                <p className="text-xs text-gray-500">{t("candidate.promises_fulfilled")}</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">1,234</p>
                                <p className="text-xs text-gray-500">{t("candidate.interactions")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Ranking */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {t("candidate.live_ranking")}
                    </h3>
                    <div className="space-y-3">
                        {candidateData.delegates.map((d, i) => (
                            <div key={d.id}>
                                <div className="flex justify-between text-xs mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" :
                                                i === 1 ? "bg-gray-100 text-gray-600" :
                                                    "bg-orange-100 text-orange-700"
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <span className={d.name === candidateData.name ? "font-semibold text-pink-600" : "text-gray-600 dark:text-gray-400"}>
                                            {d.name}
                                        </span>
                                    </div>
                                    <span className="text-gray-500">{d.votes.toLocaleString()} ({d.percentage}%)</span>
                                </div>
                                <Progress value={d.percentage} className={`h-1.5 ${d.name === candidateData.name ? "bg-pink-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Votes & Supporters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Votes */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {t("candidate.recent_votes")}
                    </h3>
                    <div className="space-y-3">
                        {candidateData.recentVotes.map((vote, i) => (
                            <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{vote.student}</p>
                                    <p className="text-xs text-gray-500">{vote.department}</p>
                                </div>
                                <span className="text-xs text-gray-400">{vote.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Supporters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" /> {t("candidate.latest_supporters")}
                    </h3>
                    <div className="space-y-3">
                        {candidateData.supporters.map((supporter) => (
                            <div key={supporter.id} className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={supporter.avatar} />
                                    <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{supporter.name}</p>
                                    <p className="text-xs text-gray-500">{supporter.role}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">"{supporter.message}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProfileSection() {
    const { t } = useTranslation()
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("candidate.my_profile")}</h2>
                    <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
                        {isEditing ? t("candidate.cancel") : t("candidate.edit_profile")}
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">{t("candidate.full_name")}</label>
                            <input type="text" value={candidateData.name} disabled={!isEditing} className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 disabled:opacity-70" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">{t("candidate.role")}</label>
                            <input type="text" value={candidateData.role} disabled={!isEditing} className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 disabled:opacity-70" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">{t("candidate.program")}</label>
                            <input type="text" value={candidateData.program} disabled={!isEditing} className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 disabled:opacity-70" />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">{t("candidate.bio")}</label>
                        <textarea value={candidateData.bio} disabled={!isEditing} rows={3} className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 disabled:opacity-70" />
                    </div>

                    {/* Program Details */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">{t("candidate.program_details")}</label>
                        <textarea value={candidateData.programDetails} disabled={!isEditing} rows={4} className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 disabled:opacity-70" />
                    </div>

                    {isEditing && (
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                            {t("candidate.save_changes")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function CampaignSection() {
    const { t } = useTranslation()
    const [shareUrl, setShareUrl] = useState("https://easyvote.com/candidate/emma-laurent")

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
        toast.success(t("candidate.link_copied"))
    }

    return (
        <div className="space-y-6">
            {/* Share Campaign */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-200 dark:border-pink-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-pink-500" /> {t("candidate.share_campaign")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t("candidate.share_description")}</p>
                <div className="flex gap-2">
                    <input type="text" value={shareUrl} readOnly className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-gray-900" />
                    <Button onClick={copyToClipboard} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        {t("candidate.copy_link")}
                    </Button>
                </div>
                <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1"><Share2 className="w-4 h-4 mr-2" /> Facebook</Button>
                    <Button variant="outline" className="flex-1"><Share2 className="w-4 h-4 mr-2" /> Twitter</Button>
                    <Button variant="outline" className="flex-1"><Share2 className="w-4 h-4 mr-2" /> LinkedIn</Button>
                </div>
            </div>

            {/* Campaign Materials */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("candidate.campaign_materials")}</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-pink-500" />
                            <span>{t("candidate.election_program")}</span>
                        </div>
                        <Button variant="outline" size="sm">{t("candidate.download")}</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Image className="w-5 h-5 text-pink-500" />
                            <span>{t("candidate.campaign_poster")}</span>
                        </div>
                        <Button variant="outline" size="sm">{t("candidate.view")}</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Video className="w-5 h-5 text-pink-500" />
                            <span>{t("candidate.presentation_video")}</span>
                        </div>
                        <Button variant="outline" size="sm">{t("candidate.watch")}</Button>
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("candidate.upcoming_events")}</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{t("candidate.debate_with_candidates")}</p>
                            <p className="text-xs text-gray-500">15 Avril 2025 - 14h00 • Amphithéâtre A</p>
                        </div>
                        <Button size="sm">{t("candidate.register")}</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{t("candidate.meet_and_greet")}</p>
                            <p className="text-xs text-gray-500">18 Avril 2025 - 12h00 • Hall du campus</p>
                        </div>
                        <Button size="sm">{t("candidate.register")}</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AnalyticsSection() {
    const { t } = useTranslation()

    return (
        <div className="space-y-6">
            {/* Vote Evolution */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("candidate.vote_evolution")}</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">{t("candidate.chart_placeholder")}</p>
                </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("candidate.votes_by_department")}</h3>
                    <div className="space-y-3">
                        <div><div className="flex justify-between text-sm"><span>Informatique</span><span>45%</span></div><Progress value={45} className="h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span>Médecine</span><span>28%</span></div><Progress value={28} className="h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span>Droit</span><span>15%</span></div><Progress value={15} className="h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span>Sciences</span><span>12%</span></div><Progress value={12} className="h-2" /></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("candidate.votes_by_level")}</h3>
                    <div className="space-y-3">
                        <div><div className="flex justify-between text-sm"><span>L3</span><span>38%</span></div><Progress value={38} className="h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span>M1</span><span>32%</span></div><Progress value={32} className="h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span>L2</span><span>18%</span></div><Progress value={18} className="h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span>Doctorat</span><span>12%</span></div><Progress value={12} className="h-2" /></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SupportersSection() {
    const { t } = useTranslation()

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("candidate.supporters_list")}</h3>
                <div className="space-y-4">
                    {candidateData.supporters.map((supporter) => (
                        <div key={supporter.id} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={supporter.avatar} />
                                <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white">{supporter.name}</p>
                                <p className="text-sm text-gray-500">{supporter.role}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">"{supporter.message}"</p>
                            </div>
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function MessagesSection() {
    const { t } = useTranslation()
    const [newMessage, setNewMessage] = useState("")

    const sendMessage = () => {
        if (newMessage.trim()) {
            toast.success(t("candidate.message_sent"))
            setNewMessage("")
        }
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("candidate.messages")}</h3>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
                {candidateData.messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${!msg.read ? "bg-pink-50 dark:bg-pink-950/20" : ""} p-3 rounded-lg transition`}>
                        <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">{msg.from.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <p className="font-medium text-gray-900 dark:text-white">{msg.from}</p>
                                <span className="text-xs text-gray-400">{msg.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{msg.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t("candidate.write_message")}
                        className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        {t("candidate.send")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Main Component
export default function CandidateDashboard() {
    const [activeSection, setActiveSection] = useState<Section>("overview")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { t } = useTranslation()

    const sectionComponents: Record<Section, React.ComponentType> = {
        overview: OverviewSection,
        profile: ProfileSection,
        campaign: CampaignSection,
        analytics: AnalyticsSection,
        supporters: SupportersSection,
        messages: MessagesSection,
    }

    const ActiveComponent = sectionComponents[activeSection]

    const sectionTitles: Record<Section, string> = {
        overview: t("candidate.overview"),
        profile: t("candidate.profile"),
        campaign: t("candidate.campaign"),
        analytics: t("candidate.analytics"),
        supporters: t("candidate.supporters"),
        messages: t("candidate.messages"),
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <Sidebar
                active={activeSection}
                onActiveChange={setActiveSection}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={() => setIsMobileMenuOpen(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader
                    isOpen={isMobileMenuOpen}
                    onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    title={sectionTitles[activeSection]}
                />

                <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                    <div className="p-4 sm:p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ActiveComponent />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    )
}