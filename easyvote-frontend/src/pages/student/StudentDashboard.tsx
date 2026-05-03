// pages/StudentDashboard.tsx
import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Vote, Users, BarChart2, MessageCircle, Home, BookOpen,
  Bell, Settings, LogOut, ChevronRight, CheckCircle,
  ThumbsUp, Send, Search, Clock, Shield, X, Award,
  Calendar, TrendingUp, Heart, Share2, Info, HelpCircle,
  Moon, Sun, Globe, Menu, User, Mail, Phone, MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { LanguageContext, useTranslation } from "@/i18n"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

// Types
interface Delegate {
  id: number
  name: string
  initials: string
  role: string
  program: string
  year: string
  image: string
  votes: number
  percentage: number
  gradient: string
  bio: string
  programDetails: string
  tags: string[]
  email: string
  phone: string
}

interface Comment {
  id: number
  author: string
  initials: string
  time: string
  text: string
  likes: number
  liked: boolean
  avatar?: string
}

// Mock data
const DELEGATES: Delegate[] = [
  {
    id: 1, name: "Emma Laurent", initials: "EL", role: "Déléguée L3", program: "Informatique", year: "L3",
    image: "https://randomuser.me/api/portraits/women/68.jpg", votes: 3247, percentage: 34,
    gradient: "from-pink-500 to-rose-500",
    bio: "Engagée pour l'innovation pédagogique et l'égalité des chances. Ma vision : une université plus connectée, inclusive et durable.",
    programDetails: "Création d'espaces de coworking, amélioration du WiFi sur tout le campus, organisation de hackathons mensuels, mise en place d'un système de mentorat entre étudiants.",
    tags: ["Innovation", "Numérique", "Égalité"],
    email: "emma.laurent@univ.fr",
    phone: "+33 6 12 34 56 78"
  },
  {
    id: 2, name: "Thomas Dubois", initials: "TD", role: "Délégué M1", program: "Économie", year: "M1",
    image: "https://randomuser.me/api/portraits/men/32.jpg", votes: 2890, percentage: 30,
    gradient: "from-indigo-500 to-purple-500",
    bio: "Pour une université plus inclusive et des opportunités pour tous. Focus sur l'insertion professionnelle et l'aide aux étudiants.",
    programDetails: "Programme de mentorat, bourses sociales renforcées, partenariats avec entreprises, ateliers CV et entretiens.",
    tags: ["Emploi", "Insertion", "Solidarité"],
    email: "thomas.dubois@univ.fr",
    phone: "+33 6 23 45 67 89"
  },
  {
    id: 3, name: "Sarah Benali", initials: "SB", role: "Déléguée L2", program: "Médecine", year: "L2",
    image: "https://randomuser.me/api/portraits/women/44.jpg", votes: 2356, percentage: 25,
    gradient: "from-blue-500 to-cyan-500",
    bio: "La santé étudiante au cœur de mon engagement. Pour un meilleur suivi médical et du bien-être sur le campus.",
    programDetails: "Amélioration du SUMPPS, consultations gratuites, campagnes de prévention, espaces de détente et relaxation.",
    tags: ["Santé", "Bien-être", "Prévention"],
    email: "sarah.benali@univ.fr",
    phone: "+33 6 34 56 78 90"
  },
  {
    id: 4, name: "Marc Chen", initials: "MC", role: "Délégué L1", program: "Sciences", year: "L1",
    image: "https://randomuser.me/api/portraits/men/45.jpg", votes: 1150, percentage: 12,
    gradient: "from-emerald-500 to-teal-500",
    bio: "Nouvelle voix pour une université plus verte et durable. Je veux faire bouger les choses !",
    programDetails: "Campus durable, recyclage, potagers partagés, sensibilisation environnementale, réduction de l'empreinte carbone.",
    tags: ["Environnement", "Durabilité", "Citoyenneté"],
    email: "marc.chen@univ.fr",
    phone: "+33 6 45 67 89 01"
  }
]

const INITIAL_COMMENTS: Comment[] = [
  { id: 1, author: "Lucas Martin", initials: "LM", time: "il y a 2h", text: "Emma a des idées concrètes pour améliorer la vie étudiante 👏", likes: 14, liked: false },
  { id: 2, author: "Amira Benali", initials: "AB", time: "il y a 5h", text: "Thomas a un vrai plan pour les bourses étudiantes, impressionnant.", likes: 7, liked: false },
  { id: 3, author: "Sophie Renaud", initials: "SR", time: "il y a 8h", text: "Super présentation hier, Sarah était très convaincante !", likes: 22, liked: false },
  { id: 4, author: "Youssef Alami", initials: "YA", time: "Hier", text: "J'espère qu'on va enfin avoir plus d'espaces de révision ouverts la nuit.", likes: 31, liked: true },
]

// Components
function VoteModal({ delegate, onConfirm, onCancel, t }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-pink-200 dark:border-pink-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🗳️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("student.confirm_vote")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("student.vote_for")}{" "}
            <span className="font-semibold text-pink-600 dark:text-pink-400">{delegate.name}</span>
            .<br />{t("student.irreversible")}
          </p>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900 mb-5">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${delegate.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
            {delegate.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{delegate.name}</p>
            <p className="text-xs text-gray-500">{delegate.role} · {delegate.program}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>{t("student.cancel")}</Button>
          <Button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg" onClick={onConfirm}>
            {t("student.confirm")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DelegateModal({ delegate, onClose, onVote, hasVoted, t }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-28 bg-gradient-to-r ${delegate.gradient} relative`}>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-900 shadow-lg">
              <AvatarImage src={delegate.image} />
              <AvatarFallback className={`bg-gradient-to-br ${delegate.gradient} text-white text-xl`}>
                {delegate.initials}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{delegate.name}</h2>
              <p className="text-sm text-gray-500">{delegate.role} · {delegate.program} {delegate.year}</p>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Info className="w-4 h-4" /> {t("student.bio")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{delegate.bio}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Award className="w-4 h-4" /> {t("student.program")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{delegate.programDetails}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {delegate.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{delegate.votes.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{t("student.votes")}</p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{delegate.percentage}%</p>
                <p className="text-xs text-gray-500">{t("student.percentage")}</p>
              </div>
              <div className="flex-1">
                <Progress value={delegate.percentage} className="h-2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" /> {delegate.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" /> {delegate.phone}
              </div>
            </div>
          </div>

          {!hasVoted ? (
            <Button onClick={onVote} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg">
              <Vote className="w-4 h-4 mr-2" /> {t("student.vote_for")} {delegate.name.split(" ")[0]}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{t("student.already_voted")}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Component
export default function StudentDashboard() {
   const { t, language } = useTranslation();
   const { language: currentLanguage, setLanguage } = useContext(LanguageContext);
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [votedFor, setVotedFor] = useState<number | null>(null)
  const [pendingVote, setPendingVote] = useState<Delegate | null>(null)
  const [profileOpen, setProfileOpen] = useState<Delegate | null>(null)
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [newComment, setNewComment] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"delegates" | "results" | "comments" | "guide">("delegates")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark", !isDark)
    localStorage.setItem("theme", newTheme)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
    toast.success(t("student.logout_success"))
  }

  const handleVoteRequest = (delegate: Delegate) => {
    if (votedFor) {
      toast.error(t("student.already_voted_error"))
      return
    }
    setPendingVote(delegate)
    setProfileOpen(null)
  }

  const handleConfirmVote = () => {
    if (!pendingVote) return
    setVotedFor(pendingVote.id)
    setPendingVote(null)
    setShowSuccess(true)
    toast.success(t("student.vote_success"))
    setTimeout(() => setShowSuccess(false), 4000)
  }

  const handleLike = (id: number) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ))
  }

  const handlePostComment = () => {
    if (!newComment.trim()) return
    setComments(prev => [{
      id: Date.now(),
      author: user?.fullName || "Étudiant",
      initials: user?.fullName?.charAt(0) || "E",
      time: t("student.just_now"),
      text: newComment,
      likes: 0,
      liked: false,
    }, ...prev])
    setNewComment("")
    toast.success(t("student.comment_posted"))
  }

  const totalVotes = DELEGATES.reduce((sum, d) => sum + d.votes, 0)
  const totalStudents = 16382
  const participationRate = Math.round((totalVotes / totalStudents) * 100)

  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Vote className="w-7 h-7 text-pink-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">EasyVote</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: "delegates", icon: Users, label: t("student.delegates") },
                { id: "results", icon: BarChart2, label: t("student.results") },
                { id: "comments", icon: MessageCircle, label: t("student.comments") },
                { id: "guide", icon: HelpCircle, label: t("student.guide") },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Globe className="w-5 h-5 text-gray-500" />
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as "fr" | "en")
                          setShowLangMenu(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                          language === lang.code
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

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                  {user?.fullName?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{user?.fullName || "Étudiant"}</p>
                <p className="text-[10px] text-gray-400">{t("student.student")}</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 lg:hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Vote className="w-7 h-7 text-pink-600" />
                  <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">EasyVote</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {[
                  { id: "delegates", icon: Users, label: t("student.delegates") },
                  { id: "results", icon: BarChart2, label: t("student.results") },
                  { id: "comments", icon: MessageCircle, label: t("student.comments") },
                  { id: "guide", icon: HelpCircle, label: t("student.guide") },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id as any)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === id
                        ? "bg-pink-50 dark:bg-pink-950/20 text-pink-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t("student.logout")}</span>
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjAiLz48L2c+PC9zdmc+')] bg-repeat" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">{t("student.election_title")}</p>
              <h1 className="text-2xl font-black mb-2">{t("student.welcome")} {user?.fullName?.split(" ")[0] || "Étudiant"} 👋</h1>
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t("student.deadline")}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{totalVotes.toLocaleString()} {t("student.votes_cast")}</span>
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" />{t("student.secure")}</span>
              </div>
            </div>
            {votedFor ? (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="text-sm font-bold">{t("student.voted")} ✓</p>
                  <p className="text-xs text-white/70">{t("student.thank_you")}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl text-center">
                <p className="text-xs text-white/70 mb-1">{t("student.your_status")}</p>
                <p className="text-sm font-bold text-amber-200">{t("student.not_voted_yet")}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-fit">
          {[
            { id: "delegates", label: t("student.delegates") },
            { id: "results", label: t("student.live_results") },
            { id: "comments", label: t("student.comments") },
            { id: "guide", label: t("student.guide") },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Delegates Tab */}
              {activeTab === "delegates" && (
                <motion.div
                  key="delegates"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  {DELEGATES.map((delegate, i) => (
                    <motion.div
                      key={delegate.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 ${
                        votedFor === delegate.id
                          ? "border-green-300 dark:border-green-700 shadow-lg shadow-green-500/10"
                          : "border-gray-200 dark:border-gray-800 hover:border-pink-200 dark:hover:border-pink-800 hover:shadow-md"
                      } overflow-hidden`}
                    >
                      {votedFor === delegate.id && (
                        <div className="bg-green-500 text-white text-xs font-medium text-center py-1.5 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> {t("student.your_choice")}
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex gap-4">
                          <Avatar className="w-14 h-14 rounded-2xl">
                            <AvatarImage src={delegate.image} />
                            <AvatarFallback className={`bg-gradient-to-br ${delegate.gradient} text-white text-lg`}>
                              {delegate.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                              <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">{delegate.name}</h3>
                                <p className="text-xs text-gray-500">{delegate.program} · {delegate.year}</p>
                              </div>
                              <Badge className={`bg-gradient-to-r ${delegate.gradient} text-white`}>
                                {delegate.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{delegate.bio}</p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {delegate.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${delegate.percentage}%` }}
                                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                                  className={`h-full bg-gradient-to-r ${delegate.gradient} rounded-full`}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {delegate.percentage}% <span className="text-gray-400">({delegate.votes.toLocaleString()})</span>
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {!votedFor ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleVoteRequest(delegate)}
                                  className={`bg-gradient-to-r ${delegate.gradient} text-white border-0 shadow-md`}
                                >
                                  <Vote className="w-3.5 h-3.5 mr-1" /> {t("student.vote")}
                                </Button>
                              ) : votedFor === delegate.id ? (
                                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 text-xs font-medium">
                                  <CheckCircle className="w-3.5 h-3.5" /> {t("student.your_choice")}
                                </div>
                              ) : null}
                              <Button size="sm" variant="outline" onClick={() => setProfileOpen(delegate)}>
                                <Info className="w-3.5 h-3.5 mr-1" /> {t("student.profile")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Results Tab */}
              {activeTab === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">{t("student.live_results")}</h2>
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />Live
                      </span>
                    </div>
                    <div className="space-y-5">
                      {DELEGATES.map((delegate, i) => (
                        <div key={delegate.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${i === 0 ? "text-pink-500" : "text-gray-400"}`}>#{i + 1}</span>
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className={`bg-gradient-to-br ${delegate.gradient} text-white text-[10px]`}>
                                  {delegate.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{delegate.name}</span>
                              {i === 0 && (
                                <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-600">
                                  {t("student.leading")}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-base font-bold text-gray-900 dark:text-white">{delegate.votes.toLocaleString()}</span>
                              <span className="text-xs text-gray-400 ml-1">({delegate.percentage}%)</span>
                            </div>
                          </div>
                          <Progress value={delegate.percentage} className={`h-2 ${i === 0 ? "" : "bg-gray-100"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                      <span>{t("student.total_votes")}: {totalVotes.toLocaleString()}</span>
                      <span>{t("student.participation")}: {participationRate}%</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Comments Tab */}
              {activeTab === "comments" && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                          {user?.fullName?.charAt(0) || "E"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                          placeholder={t("student.write_comment")}
                          className="mb-2"
                        />
                        <Button size="sm" onClick={handlePostComment} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                          <Send className="w-3.5 h-3.5 mr-1" /> {t("student.post")}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-white text-xs">
                              {comment.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.author}</span>
                              <span className="text-xs text-gray-400">{comment.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{comment.text}</p>
                            <button
                              onClick={() => handleLike(comment.id)}
                              className={`flex items-center gap-1.5 text-xs transition-colors ${
                                comment.liked ? "text-pink-500" : "text-gray-400 hover:text-pink-400"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Guide Tab */}
              {activeTab === "guide" && (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">{t("student.how_to_vote")}</h2>
                    <div className="space-y-4">
                      {[
                        { step: 1, icon: User, title: t("guide.step1_title"), desc: t("guide.step1_desc") },
                        { step: 2, icon: Shield, title: t("guide.step2_title"), desc: t("guide.step2_desc") },
                        { step: 3, icon: Vote, title: t("guide.step3_title"), desc: t("guide.step3_desc") },
                        { step: 4, icon: CheckCircle, title: t("guide.step4_title"), desc: t("guide.step4_desc") },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {item.step}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Voting Status */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("student.my_status")}</h3>
              <div className="space-y-2">
                {[
                  { ok: true, label: t("student.account_verified") },
                  { ok: true, label: t("student.institutional_email") },
                  { ok: !!votedFor, label: votedFor ? t("student.voted") : t("student.not_voted_yet") },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${row.ok ? "bg-green-500" : "bg-amber-400"}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Results */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("student.quick_results")}</h3>
              <div className="space-y-2">
                {DELEGATES.map((delegate) => (
                  <div key={delegate.id}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-600 dark:text-gray-400 truncate">{delegate.name}</span>
                      <span className="text-gray-500 font-medium">{delegate.percentage}%</span>
                    </div>
                    <Progress value={delegate.percentage} className="h-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Election Info */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl border border-pink-100 dark:border-pink-900 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("student.election_info")}</h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-pink-500" />{t("student.deadline_date")}</div>
                <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-purple-500" />{t("student.registered_students")}: 16,382</div>
                <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-indigo-500" />{t("student.anonymous_vote")}</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" />{t("student.one_vote_per_student")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {pendingVote && (
          <VoteModal delegate={pendingVote} onConfirm={handleConfirmVote} onCancel={() => setPendingVote(null)} t={t} />
        )}
        {profileOpen && (
          <DelegateModal
            delegate={profileOpen}
            onClose={() => setProfileOpen(null)}
            onVote={() => handleVoteRequest(profileOpen)}
            hasVoted={!!votedFor}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-500 text-white shadow-2xl"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{t("student.vote_success_message")}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}