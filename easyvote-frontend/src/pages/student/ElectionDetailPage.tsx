import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft,
  Vote,
  Users,
  BarChart3,
  Heart,
  MessageCircle,
  HelpCircle,
  Megaphone,
  Newspaper,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Inbox,
} from "lucide-react"

import { electionService } from "@/services/electionService"
import { candidateService } from "@/services/candidateService"
import { engagementService } from "@/services/engagementService"
import { Election, Candidate, Announcement, ElectionStatus } from "@/types"
import { CountdownTimer } from "@/components/shared/CountdownTimer"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuthStore } from "@/store/authStore"
import { formatLongFr, timeAgoFr } from "@/lib/date"
import { cn } from "@/lib/utils"

const statusMeta: Record<
  ElectionStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-foreground/10 text-foreground/70 border-foreground/20",
  },
  CAMPAIGN_ACTIVE: {
    label: "Campagne en cours",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  VOTE_ACTIVE: {
    label: "Vote en cours",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    pulse: true,
  },
  CLOSED: {
    label: "Élection terminée",
    className: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
}

function StatusBadge({ status }: { status: ElectionStatus }) {
  const meta = statusMeta[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase",
        meta.className
      )}
    >
      {meta.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
      {meta.label}
    </span>
  )
}

// ──────────────────────────────────────────────
// CANDIDATE CARD
// ──────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

function CandidateCard({ candidate, index }: { candidate: Candidate; index: number }) {
  const navigate = useNavigate()
  const initials = getInitials(candidate.userFullName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/candidates/${candidate.id}`)}
      className="group relative cursor-pointer overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-2xl hover:shadow-violet-500/15"
    >
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 blur-xl pointer-events-none" />

      <div className="relative flex items-start gap-5">
        {/* Photo */}
        <div className="shrink-0">
          {candidate.photoUrl ? (
            <img
              src={candidate.photoUrl}
              alt={candidate.userFullName}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-foreground/10 group-hover:ring-violet-400/50 transition-all"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-2 ring-foreground/10 group-hover:ring-violet-400/50 transition-all">
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:via-violet-400 group-hover:to-pink-400 transition-all">
            {candidate.userFullName}
          </h3>
          {candidate.slogan && (
            <p className="text-sm text-foreground/60 italic mt-1 line-clamp-2">
              « {candidate.slogan} »
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5 text-foreground/70">
              <Heart
                className={cn(
                  "w-3.5 h-3.5",
                  candidate.likedByMe ? "text-pink-400 fill-pink-400" : "text-pink-400"
                )}
                strokeWidth={2.5}
              />
              <span className="font-bold">{candidate.likesCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/70">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-400" strokeWidth={2.5} />
              <span className="font-bold">{candidate.commentsCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/70">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} />
              <span className="font-bold">{candidate.questionsCount}</span>
            </div>
          </div>
        </div>

        <ArrowRight
          className="w-5 h-5 text-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0 mt-2"
          strokeWidth={2.5}
        />
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────

type Tab = "candidates" | "announcements" | "news"

export default function ElectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const electionId = Number(id)

  const [election, setElection] = useState<Election | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("candidates")
  
  const { user, refreshUser } = useAuthStore()
  const [hasApplied, setHasApplied] = useState(false)
  const [isCandidateForThis, setIsCandidateForThis] = useState(false)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [applySlogan, setApplySlogan] = useState("")
  const [applyProgram, setApplyProgram] = useState("")
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    if (!electionId || Number.isNaN(electionId)) {
      toast.error("Élection introuvable")
      navigate("/elections")
      return
    }

    let mounted = true
    setLoading(true)

    const promises: Promise<any>[] = [
      electionService.getById(electionId),
      candidateService.getByElection(electionId).catch(() => [] as Candidate[]),
    ]

    if (user?.role === "STUDENT" || user?.role === "CANDIDATE") {
      promises.push(
        candidateService.getMyCandidacy(electionId)
          .then(res => {
            if (mounted) {
              setHasApplied(true)
              if (user.role === "CANDIDATE") setIsCandidateForThis(true)
            }
            return res
          })
          .catch(() => {
            if (mounted) {
              setHasApplied(false)
              setIsCandidateForThis(false)
            }
            return null
          })
      )
    }

    Promise.all(promises)
      .then(([electionData, candidatesData]) => {
        if (!mounted) return
        setElection(electionData)
        setCandidates(candidatesData ?? [])
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Impossible de charger l'élection")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [electionId, navigate])

  // Charger les announcements quand on switch sur l'onglet
  useEffect(() => {
    if (tab !== "announcements" || candidates.length === 0) return

    let mounted = true
    Promise.all(
      candidates.map((c) =>
        engagementService.getAnnouncements(c.id).catch(() => [] as Announcement[])
      )
    ).then((all) => {
      if (!mounted) return
      const flat = all.flat().sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setAnnouncements(flat)
    })

    return () => {
      mounted = false
    }
  }, [tab, candidates])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-32 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-12 w-96 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applySlogan.trim() || !applyProgram.trim()) return
    setIsApplying(true)
    try {
      await candidateService.apply({ electionId, slogan: applySlogan, program: applyProgram })
      toast.success("Candidature déposée ! En attente de validation par l'administration.")
      await refreshUser()
      setHasApplied(true)
      setShowApplyDialog(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la candidature")
    } finally {
      setIsApplying(false)
    }
  }

  if (!election) return null

  const voteEnd = new Date(election.voteEnd)
  const campaignEnd = new Date(election.campaignEnd)
  const isVoteActive = election.status === "VOTE_ACTIVE"
  const isClosed = election.status === "CLOSED"
  const isCampaign = election.status === "CAMPAIGN_ACTIVE"

  return (
    <div className="space-y-8">
      {/* ═════ Back button ═════ */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/elections")}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors group"
      >
        <ArrowLeft
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          strokeWidth={2.5}
        />
        <span>Retour aux élections</span>
      </motion.button>

      {/* ═════ Section 1 : Header de l'élection ═════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8 md:p-10"
      >
        {/* Gradient overlay décoratif */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={election.status} />
              <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>{formatLongFr(election.campaignStart)}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                {election.title}
              </span>
            </h1>

            <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
              {election.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-5 pt-2 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" strokeWidth={2.5} />
                <span>
                  <span className="text-foreground font-bold">{election.totalCandidates}</span> candidats
                </span>
              </div>
              <div className="w-px h-4 bg-foreground/10" />
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                <span>
                  <span className="text-foreground font-bold">
                    {election.totalVotes.toLocaleString("fr-FR")}
                  </span>{" "}
                  votes
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 flex flex-wrap gap-3">
              {isVoteActive && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/elections/${election.id}/vote`)}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow"
                >
                  <Zap className="w-4 h-4" strokeWidth={3} />
                  <span>Voter maintenant</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    strokeWidth={3}
                  />
                </motion.button>
              )}

              {isClosed && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/elections/${election.id}/results`)}
                  className="group inline-flex items-center gap-2 bg-foreground/5 border border-foreground/20 hover:border-foreground/40 text-foreground font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <BarChart3 className="w-4 h-4" strokeWidth={3} />
                  <span>Voir les résultats</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    strokeWidth={3}
                  />
                </motion.button>
              )}

              {isCampaign && user?.role === "STUDENT" && !hasApplied && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowApplyDialog(true)}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={3} />
                  <span>Devenir candidat</span>
                </motion.button>
              )}

              {isCampaign && hasApplied && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
                    Vous avez candidaté à cette élection ✓
                  </span>
                  {isCandidateForThis && (
                    <button onClick={() => navigate("/my-campaign")} className="text-sm font-semibold text-foreground/70 hover:text-foreground underline underline-offset-4">
                      Gérer ma campagne
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Countdown */}
          {(isVoteActive || isCampaign) && (
            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-foreground/40 uppercase mb-3">
                <Clock className="w-3.5 h-3.5" strokeWidth={3} />
                <span>{isVoteActive ? "Fin du vote dans" : "Fin de campagne dans"}</span>
              </div>
              <CountdownTimer targetDate={isVoteActive ? voteEnd : campaignEnd} />
            </div>
          )}
        </div>
      </motion.section>

      {/* ═════ Section 2 : Tabs ═════ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 border-b border-border pb-2"
      >
        {(
          [
            { key: "candidates", label: "Candidats", icon: Users, count: candidates.length },
            { key: "announcements", label: "Annonces", icon: Megaphone, count: announcements.length },
            { key: "news", label: "Actualités", icon: Newspaper },
          ] as { key: Tab; label: string; icon: typeof Users; count?: number }[]
        ).map((t) => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all rounded-xl",
                active
                  ? "text-foreground bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-pink-500/10 border border-foreground/20"
                  : "text-foreground/60 hover:text-foreground border border-transparent"
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={2.5} />
              <span>{t.label}</span>
              {typeof t.count === "number" && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    active ? "bg-foreground/10 text-foreground" : "bg-foreground/5 text-foreground/60"
                  )}
                >
                  {t.count}
                </span>
              )}
              {active && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400"
                />
              )}
            </button>
          )
        })}
      </motion.div>

      {/* ═════ Section 3 : Tab content ═════ */}
      <motion.section
        key={tab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {tab === "candidates" && (
          <>
            {candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 mb-4">
                  <Users className="w-10 h-10 text-violet-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Aucun candidat validé
                </h3>
                <p className="text-foreground/50 text-sm max-w-md">
                  Les candidatures sont en cours de validation. Revenez bientôt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {candidates.map((c, i) => (
                  <CandidateCard key={c.id} candidate={c} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "announcements" && (
          <>
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 mb-4">
                  <Megaphone className="w-10 h-10 text-violet-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Aucune annonce</h3>
                <p className="text-foreground/50 text-sm max-w-md">
                  Les candidats n'ont pas encore publié d'annonces.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 hover:border-foreground/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-lg font-bold text-foreground">{a.title}</h4>
                      <span className="text-xs text-foreground/40 shrink-0">
                        {timeAgoFr(a.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-violet-400 mb-3 font-semibold">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {a.candidateName}
                    </div>
                    <p className="text-sm text-foreground/70 whitespace-pre-line leading-relaxed">
                      {a.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "news" && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 mb-4">
              <Inbox className="w-10 h-10 text-violet-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">Bientôt disponible</h3>
            <p className="text-foreground/50 text-sm max-w-md">
              Les actualités liées à cette élection apparaîtront ici prochainement.
            </p>
          </div>
        )}
      </motion.section>

      {/* ═════ Apply Dialog ═════ */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-[500px] bg-background border border-border text-foreground rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Candidater à l'élection</DialogTitle>
            <DialogDescription className="text-foreground/60">
              Remplissez les informations de votre campagne. Ces informations seront visibles par tous les étudiants.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/90">Slogan (max 200) *</label>
              <input
                type="text"
                required
                maxLength={200}
                value={applySlogan}
                onChange={(e) => setApplySlogan(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-sm focus:border-violet-500 focus:outline-none transition-colors"
                placeholder="Ex: Pour un campus plus vert"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/90">Programme (max 5000) *</label>
              <textarea
                required
                maxLength={5000}
                value={applyProgram}
                onChange={(e) => setApplyProgram(e.target.value)}
                rows={6}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-sm focus:border-violet-500 focus:outline-none transition-colors custom-scrollbar"
                placeholder="Détaillez vos idées et votre programme..."
              />
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowApplyDialog(false)}
                className="px-4 py-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-colors text-sm font-medium text-foreground/70"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isApplying}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white text-sm font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {isApplying ? "Envoi..." : "Soumettre ma candidature"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
