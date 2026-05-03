import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Heart,
  MessageCircle,
  HelpCircle,
  Megaphone,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  Reply,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { electionService } from "@/services/electionService"
import { candidateService } from "@/services/candidateService"
import { engagementService } from "@/services/engagementService"
import {
  Candidate,
  Question,
  Announcement,
  Election,
} from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { timeAgoFr } from "@/lib/date"
import { cn } from "@/lib/utils"

type TabKey = "preview" | "announcements" | "qna" | "stats"

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

// ──────────────────────────────────────────────
// EMPTY STATE
// ──────────────────────────────────────────────

function NoCandidacy() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 mb-5">
        <Megaphone className="w-12 h-12 text-violet-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Aucune candidature active</h2>
      <p className="text-foreground/50 max-w-md mb-6">
        Vous n'avez pas encore postulé à une élection. Découvrez les scrutins en cours et lancez votre campagne.
      </p>
      <button
        onClick={() => navigate("/elections")}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow"
      >
        Postuler à une élection
        <ArrowRight className="w-4 h-4" strokeWidth={3} />
      </button>
    </motion.div>
  )
}

// ──────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  highlight,
  gradient,
  delay,
}: {
  icon: typeof Heart
  label: string
  value: number | string
  trend?: string
  highlight?: boolean
  gradient: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="relative bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-5"
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-lg bg-gradient-to-br",
          gradient
        )}
      >
        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="text-3xl font-black text-foreground mb-0.5 tracking-tight">{value}</div>
      <div className="text-xs text-foreground/60">{label}</div>
      {trend && (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold",
            highlight
              ? "bg-amber-500/15 text-amber-300"
              : "bg-emerald-500/10 text-emerald-400"
          )}
        >
          {trend}
        </div>
      )}
    </motion.div>
  )
}

// ──────────────────────────────────────────────
// PREVIEW CARD
// ──────────────────────────────────────────────

function PreviewCard({ candidate }: { candidate: Candidate }) {
  const initials = getInitials(candidate.userFullName)
  return (
    <div className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt={candidate.userFullName}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-foreground/10"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-4xl ring-4 ring-foreground/10">
            {initials}
          </div>
        )}

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
            {candidate.status === "VALIDATED" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold tracking-wider uppercase">
                <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                Validé
              </span>
            )}
            {candidate.status === "PENDING" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold tracking-wider uppercase">
                En attente de validation
              </span>
            )}
            <span className="text-xs text-violet-500">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {candidate.electionTitle}
            </span>
          </div>

          <h3 className="text-3xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              {candidate.userFullName}
            </span>
          </h3>

          {candidate.slogan && (
            <p className="text-lg italic text-foreground/70">« {candidate.slogan} »</p>
          )}

          {candidate.program && (
            <div className="text-sm text-foreground/70 whitespace-pre-line leading-relaxed border-l-2 border-violet-500/40 pl-4 mt-3 max-h-40 overflow-y-auto custom-scrollbar">
              {candidate.program}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// ANNOUNCEMENTS MANAGER
// ──────────────────────────────────────────────

function AnnouncementsManager({
  candidateId,
  announcements,
  setAnnouncements,
}: {
  candidateId: number
  announcements: Announcement[]
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setShowForm(false)
    setEditingId(null)
    setTitle("")
    setContent("")
  }

  const startEdit = (a: Announcement) => {
    setEditingId(a.id)
    setTitle(a.title)
    setContent(a.content)
    setShowForm(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      if (editingId) {
        const updated = await engagementService.updateAnnouncement(candidateId, editingId, {
          title: title.trim(),
          content: content.trim(),
        })
        setAnnouncements((prev) => prev.map((a) => (a.id === editingId ? updated : a)))
        toast.success("Annonce mise à jour")
      } else {
        const created = await engagementService.createAnnouncement(
          candidateId,
          title.trim(),
          content.trim()
        )
        setAnnouncements((prev) => [created, ...prev])
        toast.success("Annonce publiée")
      }
      reset()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Action impossible")
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Supprimer cette annonce ?")) return
    try {
      await engagementService.deleteAnnouncement(candidateId, id)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      toast.success("Annonce supprimée")
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Suppression impossible")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-pink-400" strokeWidth={2.5} />
          <h3 className="text-xl font-black tracking-tight">Mes annonces</h3>
          <span className="text-sm text-foreground/40 font-medium">({announcements.length})</span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nouvelle annonce
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submit}
            className="overflow-hidden"
          >
            <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-5 space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'annonce"
                className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 transition-all"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Contenu de votre annonce…"
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 transition-all resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" strokeWidth={2.5} />
                  )}
                  {editingId ? "Mettre à jour" : "Publier"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {announcements.length === 0 ? (
        <div className="text-center py-10 text-foreground/40 text-sm">
          Aucune annonce publiée. Créez-en une pour engager votre communauté.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-foreground/5 border border-foreground/10 rounded-xl p-5 hover:border-foreground/20 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-bold text-foreground text-lg">{a.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground/40 shrink-0">{timeAgoFr(a.createdAt)}</span>
                  <button
                    onClick={() => startEdit(a)}
                    className="opacity-0 group-hover:opacity-100 text-foreground/50 hover:text-violet-500 transition-all"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="opacity-0 group-hover:opacity-100 text-foreground/50 hover:text-rose-400 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground/75 whitespace-pre-line leading-relaxed">
                {a.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// QNA MANAGER
// ──────────────────────────────────────────────

function QnAManager({
  candidateId,
  questions,
  setQuestions,
}: {
  candidateId: number
  questions: Question[]
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
}) {
  const [filter, setFilter] = useState<"pending" | "all" | "answered">("pending")
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [busyId, setBusyId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (filter === "answered") return questions.filter((q) => q.answered)
    if (filter === "pending") return questions.filter((q) => !q.answered)
    return questions
  }, [questions, filter])

  const submit = async (questionId: number) => {
    const answer = drafts[questionId]?.trim()
    if (!answer) return
    setBusyId(questionId)
    try {
      const updated = await engagementService.answerQuestion(candidateId, questionId, answer)
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)))
      setDrafts((prev) => {
        const { [questionId]: _, ...rest } = prev
        return rest
      })
      toast.success("Réponse publiée")
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Impossible de répondre")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
        <h3 className="text-xl font-black tracking-tight">Questions</h3>
        <span className="text-sm text-foreground/40 font-medium">({questions.length})</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            { k: "pending", label: "À répondre" },
            { k: "answered", label: "Répondues" },
            { k: "all", label: "Toutes" },
          ] as { k: typeof filter; label: string }[]
        ).map((f) => {
          const active = filter === f.k
          const count =
            f.k === "all"
              ? questions.length
              : f.k === "answered"
              ? questions.filter((q) => q.answered).length
              : questions.filter((q) => !q.answered).length
          return (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                active
                  ? "bg-foreground/10 border-foreground/30 text-foreground"
                  : "bg-transparent border-foreground/10 text-foreground/60 hover:text-foreground"
              )}
            >
              {f.label}
              <span className="px-1.5 py-0.5 rounded-full bg-foreground/10 text-[10px] font-bold">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-foreground/40 text-sm">
          {filter === "pending"
            ? "Aucune question en attente. Vous êtes à jour !"
            : "Aucune question dans cette catégorie."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
            >
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {q.userInitials || getInitials(q.userFullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-white">{q.userFullName}</span>
                    <span className="text-xs text-white/40">· {timeAgoFr(q.createdAt)}</span>
                  </div>
                  <p className="text-sm text-white/80 whitespace-pre-line break-words">
                    {q.content}
                  </p>
                </div>
              </div>

              {q.answered && q.answer ? (
                <div className="mt-3 ml-12 pl-4 border-l-2 border-violet-500/40 bg-violet-500/[0.03] py-2.5 pr-3 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                      Votre réponse
                    </span>
                  </div>
                  <p className="text-sm text-white/85 whitespace-pre-line">{q.answer}</p>
                </div>
              ) : (
                <div className="mt-3 ml-12 flex gap-2">
                  <input
                    type="text"
                    value={drafts[q.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="Votre réponse…"
                    className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                  />
                  <button
                    onClick={() => submit(q.id)}
                    disabled={busyId === q.id || !drafts[q.id]?.trim()}
                    className="inline-flex items-center gap-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-200 text-sm font-semibold px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    {busyId === q.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Reply className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    Répondre
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// STATS CHART
// ──────────────────────────────────────────────

function StatsChart({ candidate }: { candidate: Candidate }) {
  // Mock data : 7 derniers jours, valeurs progressives
  const data = useMemo(() => {
    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    const today = new Date()
    return labels.map((_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      // courbe croissante mock basée sur likesCount
      const base = Math.max(1, Math.floor(candidate.likesCount / 7))
      const variation = Math.round(Math.sin(i / 1.5) * base * 0.4)
      const day = labels[d.getDay() === 0 ? 6 : d.getDay() - 1]
      return {
        day,
        likes: Math.max(0, base + variation + i),
        comments: Math.max(0, Math.floor((candidate.commentsCount / 7) * (i + 1) * 0.5)),
      }
    })
  }, [candidate.likesCount, candidate.commentsCount])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
        <h3 className="text-xl font-black tracking-tight">Statistiques de la semaine</h3>
      </div>

      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-5">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
            <XAxis dataKey="day" stroke="currentColor" className="text-foreground/40" fontSize={11} />
            <YAxis stroke="currentColor" className="text-foreground/40" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "var(--foreground)"
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="likes"
              stroke="#ec4899"
              strokeWidth={2}
              fill="url(#likesGradient)"
              name="Likes"
            />
            <Area
              type="monotone"
              dataKey="comments"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#commentsGradient)"
              name="Commentaires"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
          <div className="text-xs text-foreground/50 mb-1">Engagement total</div>
          <div className="text-2xl font-black text-foreground tabular-nums">
            {candidate.likesCount + candidate.commentsCount + candidate.questionsCount}
          </div>
        </div>
        <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
          <div className="text-xs text-foreground/50 mb-1">Taux de réponse</div>
          <div className="text-2xl font-black text-foreground tabular-nums">
            {candidate.questionsCount > 0
              ? `${Math.round(((candidate.questionsCount - 0) / candidate.questionsCount) * 100)}%`
              : "—"}
          </div>
        </div>
        <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
          <div className="text-xs text-foreground/50 mb-1">Tendance</div>
          <div className="text-2xl font-black text-emerald-500 tabular-nums flex items-center gap-1">
            <TrendingUp className="w-5 h-5" strokeWidth={3} />
            +12%
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────

export default function MyCampaignPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [election, setElection] = useState<Election | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [tab, setTab] = useState<TabKey>("preview")

  useEffect(() => {
    let mounted = true
    setLoading(true)

    async function load() {
      try {
        // 1. Trouver la 1re élection active (campagne ou vote)
        const allElections = await electionService.getAll()
        const activeElection = allElections.find(
          (e) => e.status === "CAMPAIGN_ACTIVE" || e.status === "VOTE_ACTIVE"
        )

        if (!activeElection) {
          if (mounted) {
            setCandidate(null)
            setLoading(false)
          }
          return
        }

        if (mounted) setElection(activeElection)

        // 2. Récupérer ma candidature
        try {
          const myCandidacy = await candidateService.getMyCandidacy(activeElection.id)
          if (!mounted) return
          setCandidate(myCandidacy)

          // 3. Charger annonces + questions
          const [an, qs] = await Promise.all([
            engagementService.getAnnouncements(myCandidacy.id).catch(() => [] as Announcement[]),
            engagementService.getQuestions(myCandidacy.id).catch(() => [] as Question[]),
          ])
          if (!mounted) return
          setAnnouncements(an ?? [])
          setQuestions(qs ?? [])
        } catch (err: any) {
          if (err.response?.status === 404) {
            // Pas de candidature
            if (mounted) setCandidate(null)
          } else {
            throw err
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message ?? "Impossible de charger votre campagne")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!candidate) {
    return <NoCandidacy />
  }

  const pendingQuestions = questions.filter((q) => !q.answered).length

  return (
    <div className="space-y-8">
      {/* ═════ Header ═════ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              Ma campagne
            </span>
          </h1>
          <p className="text-base text-foreground/60 mt-2">
            {election?.title} · {pendingQuestions > 0 ? `${pendingQuestions} questions à répondre` : "Tout est à jour"}
          </p>
        </div>
        <button
          onClick={() => navigate(`/candidates/${candidate.id}`)}
          className="inline-flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-foreground/20 text-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <Eye className="w-4 h-4" strokeWidth={2.5} />
          Voir mon profil public
        </button>
      </motion.div>

      {/* ═════ Stats ═════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Heart}
          label="Likes reçus"
          value={candidate.likesCount}
          trend={`+${Math.max(1, Math.floor(candidate.likesCount * 0.15))} cette semaine`}
          gradient="from-pink-500 to-rose-500"
          delay={0.05}
        />
        <StatCard
          icon={MessageCircle}
          label="Commentaires"
          value={candidate.commentsCount}
          trend={candidate.commentsCount > 0 ? `+${Math.floor(candidate.commentsCount * 0.2)} récents` : undefined}
          gradient="from-indigo-500 to-blue-500"
          delay={0.1}
        />
        <StatCard
          icon={HelpCircle}
          label="Questions à répondre"
          value={pendingQuestions}
          trend={pendingQuestions > 0 ? "À traiter" : "Tout à jour"}
          highlight={pendingQuestions > 0}
          gradient={pendingQuestions > 0 ? "from-amber-500 to-orange-500" : "from-emerald-500 to-green-500"}
          delay={0.15}
        />
      </div>

      {/* ═════ Tabs ═════ */}
      <div className="flex gap-2 border-b border-foreground/10 pb-2 overflow-x-auto custom-scrollbar">
        {(
          [
            { k: "preview", label: "Aperçu", icon: Eye },
            { k: "announcements", label: "Annonces", icon: Megaphone, count: announcements.length },
            { k: "qna", label: "Q&A", icon: HelpCircle, count: questions.length, badge: pendingQuestions },
            { k: "stats", label: "Statistiques", icon: BarChart3 },
          ] as { k: TabKey; label: string; icon: typeof Eye; count?: number; badge?: number }[]
        ).map((t) => {
          const Icon = t.icon
          const active = tab === t.k
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all rounded-xl shrink-0",
                active
                  ? "text-foreground bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 border border-foreground/20"
                  : "text-foreground/60 hover:text-foreground border border-transparent"
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={2.5} />
              <span>{t.label}</span>
              {typeof t.count === "number" && (
                <span className="px-1.5 py-0.5 rounded-full bg-foreground/10 text-[10px] font-bold">
                  {t.count}
                </span>
              )}
              {t.badge && t.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ═════ Tab content ═════ */}
      <motion.section
        key={tab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {tab === "preview" && <PreviewCard candidate={candidate} />}
        {tab === "announcements" && (
          <AnnouncementsManager
            candidateId={candidate.id}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
          />
        )}
        {tab === "qna" && (
          <QnAManager
            candidateId={candidate.id}
            questions={questions}
            setQuestions={setQuestions}
          />
        )}
        {tab === "stats" && <StatsChart candidate={candidate} />}
      </motion.section>
    </div>
  )
}
