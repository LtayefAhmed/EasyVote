import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  HelpCircle,
  Megaphone,
  Send,
  Trash2,
  Sparkles,
  CheckCircle2,
  Loader2,
  Plus,
  X,
  Reply,
} from "lucide-react"

import { candidateService } from "@/services/candidateService"
import { engagementService } from "@/services/engagementService"
import { Candidate, Comment, Question, Announcement } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/store/authStore"
import { timeAgoFr } from "@/lib/date"
import { cn } from "@/lib/utils"

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
// SECTION : COMMENTS
// ──────────────────────────────────────────────

function CommentsSection({
  candidateId,
  comments,
  setComments,
}: {
  candidateId: number
  comments: Comment[]
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
}) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      const newComment = await engagementService.postComment(candidateId, trimmed)
      setComments((prev) => [newComment, ...prev])
      setContent("")
      toast.success("Commentaire publié")
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Impossible de publier le commentaire")
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (commentId: number) => {
    if (!confirm("Supprimer ce commentaire ?")) return
    try {
      await engagementService.deleteComment(candidateId, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success("Commentaire supprimé")
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Suppression impossible")
    }
  }

  return (
    <section
      id="comments"
      className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-indigo-400" strokeWidth={2.5} />
        <h2 className="text-xl font-black tracking-tight">
          Commentaires
          <span className="ml-2 text-sm text-foreground/40 font-medium">({comments.length})</span>
        </h2>
      </div>

      <form onSubmit={submit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Partagez votre point de vue…"
          className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 focus:bg-foreground/10 transition-all resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" strokeWidth={2.5} />
            )}
            Publier
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <div className="text-center py-10 text-foreground/40 text-sm">
          Aucun commentaire pour le moment. Soyez le premier à réagir !
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className="flex gap-3 p-4 bg-foreground/5 border border-foreground/10 rounded-xl hover:border-foreground/20 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.userInitials || getInitials(c.userFullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{c.userFullName}</span>
                    <span className="text-xs text-foreground/40">· {timeAgoFr(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-line break-words">
                    {c.content}
                  </p>
                </div>
                {c.mine && (
                  <button
                    onClick={() => remove(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-foreground/40 hover:text-rose-400 transition-all shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}

// ──────────────────────────────────────────────
// SECTION : Q&A
// ──────────────────────────────────────────────

type QuestionFilter = "all" | "answered" | "pending"

function QnASection({
  candidateId,
  candidateUserId,
  questions,
  setQuestions,
}: {
  candidateId: number
  candidateUserId: number
  questions: Question[]
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
}) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.id === candidateUserId

  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<QuestionFilter>("all")
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({})
  const [answeringId, setAnsweringId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (filter === "answered") return questions.filter((q) => q.answered)
    if (filter === "pending") return questions.filter((q) => !q.answered)
    return questions
  }, [questions, filter])

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      const newQ = await engagementService.askQuestion(candidateId, trimmed)
      setQuestions((prev) => [newQ, ...prev])
      setContent("")
      setShowForm(false)
      toast.success("Question envoyée")
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Impossible d'envoyer la question")
    } finally {
      setSubmitting(false)
    }
  }

  const submitAnswer = async (questionId: number) => {
    const answer = answerDrafts[questionId]?.trim()
    if (!answer) return
    setAnsweringId(questionId)
    try {
      const updated = await engagementService.answerQuestion(candidateId, questionId, answer)
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)))
      setAnswerDrafts((prev) => {
        const { [questionId]: _, ...rest } = prev
        return rest
      })
      toast.success("Réponse publiée")
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Impossible de répondre")
    } finally {
      setAnsweringId(null)
    }
  }

  return (
    <section
      id="questions"
      className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
          <h2 className="text-xl font-black tracking-tight">
            Questions & Réponses
            <span className="ml-2 text-sm text-foreground/40 font-medium">({questions.length})</span>
          </h2>
        </div>
        {!isOwner && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-foreground/20 text-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            {showForm ? <X className="w-4 h-4" strokeWidth={2.5} /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
            {showForm ? "Annuler" : "Poser une question"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && !isOwner && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={askQuestion}
            className="mb-6 overflow-hidden"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Quelle est votre question pour ce candidat ?"
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 focus:bg-foreground/10 transition-all resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={2.5} />}
                Envoyer
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filtres */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(
          [
            { k: "all", label: "Toutes" },
            { k: "answered", label: "Répondues" },
            { k: "pending", label: "En attente" },
          ] as { k: QuestionFilter; label: string }[]
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
                  : "bg-transparent border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20"
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
          {questions.length === 0
            ? "Aucune question pour le moment."
            : "Aucune question dans cette catégorie."}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-foreground/5 border border-foreground/10 rounded-xl p-4 hover:border-foreground/20 transition-all"
            >
              {/* Question */}
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {q.userInitials || getInitials(q.userFullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{q.userFullName}</span>
                    <span className="text-xs text-foreground/40">· {timeAgoFr(q.createdAt)}</span>
                    {!q.answered && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                        En attente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-line break-words">
                    {q.content}
                  </p>
                </div>
              </div>

              {/* Réponse existante */}
              {q.answered && q.answer && (
                <div className="mt-4 ml-12 pl-4 border-l-2 border-violet-500/40 bg-violet-500/5 py-3 pr-3 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">
                      Réponse du candidat
                    </span>
                    {q.answeredAt && (
                      <span className="text-xs text-foreground/40">· {timeAgoFr(q.answeredAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/85 whitespace-pre-line break-words">
                    {q.answer}
                  </p>
                </div>
              )}

              {/* Form de réponse pour le candidat */}
              {isOwner && !q.answered && (
                <div className="mt-3 ml-12 flex gap-2">
                  <input
                    type="text"
                    value={answerDrafts[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="Votre réponse…"
                    className="flex-1 px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 transition-all"
                  />
                  <button
                    onClick={() => submitAnswer(q.id)}
                    disabled={answeringId === q.id || !answerDrafts[q.id]?.trim()}
                    className="inline-flex items-center gap-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-200 text-sm font-semibold px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    {answeringId === q.id ? (
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
    </section>
  )
}

// ──────────────────────────────────────────────
// SECTION : ANNOUNCEMENTS
// ──────────────────────────────────────────────

function AnnouncementsSection({
  announcements,
  candidateUserId,
}: {
  announcements: Announcement[]
  candidateUserId: number
}) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.id === candidateUserId

  if (announcements.length === 0) {
    return (
      <section className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-5 h-5 text-pink-400" strokeWidth={2.5} />
          <h2 className="text-xl font-black tracking-tight">Annonces de campagne</h2>
        </div>
        <div className="text-center py-6 text-foreground/40 text-sm">
          {isOwner
            ? "Vous n'avez pas encore publié d'annonce. Créez-en une depuis Ma campagne."
            : "Aucune annonce publiée pour le moment."}
        </div>
      </section>
    )
  }

  const sorted = [...announcements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <section className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Megaphone className="w-5 h-5 text-pink-400" strokeWidth={2.5} />
        <h2 className="text-xl font-black tracking-tight">
          Annonces de campagne
          <span className="ml-2 text-sm text-foreground/40 font-medium">({announcements.length})</span>
        </h2>
      </div>
      <div className="space-y-4">
        {sorted.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-foreground/5 border border-foreground/10 rounded-xl p-5 hover:border-foreground/20 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-foreground text-lg">{a.title}</h3>
              <span className="text-xs text-foreground/40 shrink-0">{timeAgoFr(a.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground/75 whitespace-pre-line leading-relaxed">{a.content}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const candidateId = Number(id)

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    if (!candidateId || Number.isNaN(candidateId)) {
      toast.error("Candidat introuvable")
      navigate("/elections")
      return
    }

    let mounted = true
    setLoading(true)

    Promise.all([
      candidateService.getById(candidateId),
      engagementService.getComments(candidateId).catch(() => [] as Comment[]),
      engagementService.getQuestions(candidateId).catch(() => [] as Question[]),
      engagementService.getAnnouncements(candidateId).catch(() => [] as Announcement[]),
    ])
      .then(([c, cm, qs, an]) => {
        if (!mounted) return
        setCandidate(c)
        setComments(cm ?? [])
        setQuestions(qs ?? [])
        setAnnouncements(an ?? [])
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Impossible de charger le profil")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [candidateId, navigate])

  const toggleLike = async () => {
    if (!candidate || liking) return
    setLiking(true)

    // Optimistic update
    const prev = candidate
    setCandidate({
      ...candidate,
      likedByMe: !candidate.likedByMe,
      likesCount: candidate.likedByMe ? candidate.likesCount - 1 : candidate.likesCount + 1,
    })

    try {
      const result = await engagementService.toggleLike(candidate.id)
      setCandidate((c) =>
        c ? { ...c, likedByMe: result.liked, likesCount: result.totalLikes } : c
      )
    } catch (err: any) {
      setCandidate(prev) // rollback
      toast.error(err.response?.data?.message ?? "Action impossible")
    } finally {
      setLiking(false)
    }
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!candidate) return null

  const initials = getInitials(candidate.userFullName)

  return (
    <div className="space-y-8">
      {/* ═════ Back button ═════ */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(`/elections/${candidate.electionId}`)}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors group"
      >
        <ArrowLeft
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          strokeWidth={2.5}
        />
        <span>Retour à l'élection</span>
      </motion.button>

      {/* ═════ Hero header ═════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8 md:p-10"
      >
        {/* Gradient overlay */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/15 via-violet-500/15 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Photo */}
          <div className="shrink-0">
            {candidate.photoUrl ? (
              <img
                src={candidate.photoUrl}
                alt={candidate.userFullName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-foreground/10 shadow-2xl shadow-violet-500/20"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-5xl md:text-6xl shadow-2xl shadow-violet-500/30 ring-4 ring-foreground/10">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {candidate.status === "VALIDATED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold tracking-wider uppercase">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                  Candidat validé
                </span>
              )}
              <Link
                to={`/elections/${candidate.electionId}`}
                className="inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                {candidate.electionTitle}
              </Link>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                {candidate.userFullName}
              </span>
            </h1>

            {candidate.slogan && (
              <p className="text-lg md:text-xl italic text-foreground/70">
                « {candidate.slogan} »
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 justify-center md:justify-start">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleLike}
                disabled={liking}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all",
                  candidate.likedByMe
                    ? "bg-pink-500/10 border-pink-500/40 text-pink-500 shadow-lg shadow-pink-500/10"
                    : "bg-foreground/5 border-foreground/10 hover:border-foreground/30 text-foreground"
                )}
              >
                <motion.span
                  key={candidate.likedByMe ? "liked" : "not"}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      candidate.likedByMe && "fill-pink-500 text-pink-500"
                    )}
                    strokeWidth={2.5}
                  />
                </motion.span>
                <motion.span
                  key={candidate.likesCount}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="tabular-nums"
                >
                  {candidate.likesCount}
                </motion.span>
                <span className="text-foreground/60 font-normal">
                  {candidate.likesCount === 1 ? "Like" : "Likes"}
                </span>
              </motion.button>

              <button
                onClick={() => scrollTo("comments")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-foreground/5 border border-foreground/10 hover:border-foreground/30 text-foreground transition-all"
              >
                <MessageCircle className="w-4 h-4 text-indigo-400" strokeWidth={2.5} />
                <span className="tabular-nums">{candidate.commentsCount}</span>
                <span className="text-foreground/60 font-normal">Commentaires</span>
              </button>

              <button
                onClick={() => scrollTo("questions")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-foreground/5 border border-foreground/10 hover:border-foreground/30 text-foreground transition-all"
              >
                <HelpCircle className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
                <span className="tabular-nums">{candidate.questionsCount}</span>
                <span className="text-foreground/60 font-normal">Questions</span>
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═════ Programme ═════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8"
      >
        <h2 className="text-2xl font-black tracking-tight mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" strokeWidth={2.5} />
          Programme électoral
        </h2>
        {candidate.program ? (
          <div className="text-foreground/80 whitespace-pre-line leading-relaxed text-base">
            {candidate.program}
          </div>
        ) : (
          <p className="text-foreground/40 text-sm">Aucun programme renseigné pour l'instant.</p>
        )}
      </motion.section>

      {/* ═════ Annonces ═════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <AnnouncementsSection
          announcements={announcements}
          candidateUserId={candidate.userId}
        />
      </motion.div>

      {/* ═════ Commentaires ═════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <CommentsSection
          candidateId={candidate.id}
          comments={comments}
          setComments={setComments}
        />
      </motion.div>

      {/* ═════ Q&A ═════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <QnASection
          candidateId={candidate.id}
          candidateUserId={candidate.userId}
          questions={questions}
          setQuestions={setQuestions}
        />
      </motion.div>
    </div>
  )
}
