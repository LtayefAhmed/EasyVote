import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft, Vote, Users, Shield, Copy, Check, BarChart3, Home,
  Heart, MessageCircle, HelpCircle, Zap, Lock,
  Clock, CheckCircle2, XCircle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CountdownTimer } from "@/components/shared/CountdownTimer"
import { voteService } from "@/services/voteService"
import { electionService } from "@/services/electionService"
import { candidateService } from "@/services/candidateService"
import { cn } from "@/lib/utils"
import type { Candidate, Election, VoteStatusResponse } from "@/types"

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase()
}

type Step = "select" | "confirm" | "success"

export default function VotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const electionId = Number(id)

  const [election, setElection] = useState<Election | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [voteStatus, setVoteStatus] = useState<VoteStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<Step>("select")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!electionId || Number.isNaN(electionId)) { navigate("/elections"); return }
    let mounted = true
    setLoading(true)
    Promise.all([
      electionService.getById(electionId),
      voteService.getVoteStatus(electionId),
      candidateService.getByElection(electionId).catch(() => [] as Candidate[]),
    ]).then(([el, status, cands]) => {
      if (!mounted) return
      setElection(el)
      setVoteStatus(status)
      setCandidates(cands)
    }).catch((err) => {
      toast.error(err.response?.data?.message ?? "Impossible de charger la page de vote")
    }).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [electionId, navigate])

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setConfirmChecked(false)
    setStep("confirm")
  }

  const handleVote = async () => {
    if (!selectedCandidate) return
    setIsVoting(true)
    try {
      const response = await voteService.castVote(electionId, selectedCandidate.id)
      setConfirmationCode(response.confirmationCode)
      setStep("success")
      toast.success("Vote enregistré avec succès !")
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors du vote"
      toast.error(msg)
      if (msg.includes("déjà voté")) {
        const status = await voteService.getVoteStatus(electionId)
        setVoteStatus(status)
        setStep("select")
      }
    } finally {
      setIsVoting(false)
    }
  }

  const handleCopy = () => {
    if (confirmationCode) {
      navigator.clipboard.writeText(confirmationCode)
      setCopied(true)
      toast.success("Code copié !")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!election) return null

  // ── Already voted ──
  if (voteStatus && voteStatus.hasVoted && step !== "success") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>
        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">
          Vous avez déjà voté
        </h1>
        <p className="text-foreground/60 max-w-md mb-8">Votre vote a été enregistré anonymement pour cette élection.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/elections/${electionId}/results`)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-500/30">
            <BarChart3 className="w-4 h-4" strokeWidth={3} /> 
            {election.status === "VOTE_ACTIVE" ? "Voir le taux de participation" : "Voir les résultats"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-foreground/5 border border-foreground/20 text-foreground font-bold px-6 py-3 rounded-xl">
            <Home className="w-4 h-4" strokeWidth={3} /> Tableau de bord
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // ── Cannot vote ──
  if (voteStatus && !voteStatus.canVote && !voteStatus.hasVoted && step !== "success") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/30">
          <XCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>
        <h1 className="text-3xl font-black mb-2 text-foreground">Vote indisponible</h1>
        <p className="text-foreground/60 max-w-md mb-8">{voteStatus.message || "Vous ne pouvez pas voter pour le moment."}</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/elections")}
          className="inline-flex items-center gap-2 bg-foreground/5 border border-foreground/20 text-foreground font-bold px-6 py-3 rounded-xl">
          <ArrowLeft className="w-4 h-4" strokeWidth={3} /> Retour aux élections
        </motion.button>
      </motion.div>
    )
  }

  // ── SUCCESS SCREEN ──
  if (step === "success") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Animated checkmark */}
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/40">
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.3, duration: 0.5 }}>
            <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-4xl font-black mb-3 bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">
          Vote enregistré ! 🎉
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-lg text-foreground/60 max-w-md mb-8">
          Votre voix a été comptabilisée anonymement.
        </motion.p>

        {/* Confirmation code */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8 mb-8 max-w-md w-full">
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-foreground/40 uppercase mb-4">
            <Shield className="w-3.5 h-3.5" strokeWidth={3} /> Code de confirmation
          </div>
          <div className="font-mono text-3xl font-black text-foreground tracking-[0.3em] mb-4 text-center">
            {confirmationCode}
          </div>
          <p className="text-xs text-foreground/50 mb-5">
            Conservez ce code comme preuve. Il ne révèle pas pour qui vous avez voté.
          </p>
          <button onClick={handleCopy}
            className="inline-flex items-center gap-2 bg-foreground/5 border border-foreground/20 hover:border-foreground/40 text-foreground text-sm font-bold px-4 py-2.5 rounded-xl w-full justify-center transition-colors">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copié !" : "Copier le code"}
          </button>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/elections/${electionId}/results`)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-500/30">
            <BarChart3 className="w-4 h-4" strokeWidth={3} /> Voir les résultats
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-foreground/5 border border-foreground/20 text-foreground font-bold px-6 py-3 rounded-xl">
            <Home className="w-4 h-4" strokeWidth={3} /> Tableau de bord
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  // ── STEP 1: SELECT CANDIDATE ──
  return (
    <div className="space-y-8">
      {/* Back button */}
      <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(`/elections/${electionId}`)}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
        Retour à l'élection
      </motion.button>

      {/* Header */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase">Vote en cours</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              <span className="text-foreground/90">Voter — </span>
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">{election.title}</span>
            </h1>
            <p className="text-foreground/60 max-w-2xl">Choisissez le candidat de votre choix. Votre vote sera anonyme et définitif.</p>
          </div>
          {election.voteEnd && (
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-foreground/40 uppercase mb-2">
                <Clock className="w-3.5 h-3.5" strokeWidth={3} /> Temps restant
              </div>
              <CountdownTimer targetDate={new Date(election.voteEnd)} />
            </div>
          )}
        </div>
      </motion.section>

      {/* Candidates Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-foreground/40" strokeWidth={2.5} />
          <h2 className="text-xs font-black tracking-widest text-foreground/40 uppercase">
            {candidates.length} candidats
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {candidates.map((candidate, i) => {
            const initials = getInitials(candidate.userFullName)
            const firstName = candidate.userFullName.split(" ")[0]
            return (
              <motion.div key={candidate.id}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }} whileHover={{ y: -4 }}
                className="group relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-500/15 cursor-pointer"
                onClick={() => handleSelectCandidate(candidate)}>
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 blur-xl pointer-events-none" />
                <div className="relative space-y-4">
                  <div className="flex items-start gap-4">
                    {candidate.photoUrl ? (
                      <img src={candidate.photoUrl.startsWith("http") ? candidate.photoUrl : `http://localhost:8082${candidate.photoUrl}`}
                        alt={candidate.userFullName}
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-foreground/10 group-hover:ring-violet-400/50 transition-all" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-2 ring-foreground/10 group-hover:ring-violet-400/50 transition-all">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:via-violet-500 group-hover:to-pink-500 transition-all">
                        {candidate.userFullName}
                      </h3>
                      {candidate.slogan && <p className="text-sm text-foreground/60 italic mt-1">« {candidate.slogan} »</p>}
                    </div>
                  </div>
                  {candidate.program && (
                    <p className="text-sm text-foreground/50 line-clamp-2">{candidate.program}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-foreground/70">
                      <Heart className={cn("w-3.5 h-3.5", candidate.likedByMe ? "text-pink-500 fill-pink-500" : "text-pink-500")} strokeWidth={2.5} />
                      <span className="font-bold">{candidate.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground/70">
                      <MessageCircle className="w-3.5 h-3.5 text-indigo-400" strokeWidth={2.5} />
                      <span className="font-bold">{candidate.commentsCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground/70">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
                      <span className="font-bold">{candidate.questionsCount}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); handleSelectCandidate(candidate) }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow text-sm">
                    <Zap className="w-4 h-4" strokeWidth={3} /> Voter pour {firstName}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Security notice */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">Vote anonyme et cryptographiquement sécurisé</h4>
          <p className="text-xs text-foreground/50">Votre identité est dissociée de votre vote via un système de jetons hashés (SHA-256). Vous ne pourrez pas modifier votre choix.</p>
        </div>
      </motion.div>

      {/* CONFIRM DIALOG */}
      <Dialog open={step === "confirm"} onOpenChange={(open) => !open && setStep("select")}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Confirmer votre vote</DialogTitle>
            <DialogDescription className="text-foreground/60">Cette action est définitive et anonyme.</DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <div className="flex flex-col items-center gap-4 py-4">
              {selectedCandidate.photoUrl ? (
                <img src={selectedCandidate.photoUrl.startsWith("http") ? selectedCandidate.photoUrl : `http://localhost:8082${selectedCandidate.photoUrl}`}
                  alt={selectedCandidate.userFullName}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-400/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-3xl ring-4 ring-violet-400/30">
                  {getInitials(selectedCandidate.userFullName)}
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{selectedCandidate.userFullName}</h3>
              <p className="text-sm text-foreground/60 text-center">
                Vous êtes sur le point de voter pour <strong className="text-foreground">{selectedCandidate.userFullName}</strong>.
              </p>
            </div>
          )}
          <label className="flex items-start gap-3 p-4 bg-foreground/5 border border-foreground/10 rounded-xl cursor-pointer">
            <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-violet-500" />
            <span className="text-sm text-foreground/70">Je comprends que mon vote est <strong className="text-foreground">définitif</strong> et ne peut pas être modifié.</span>
          </label>
          <DialogFooter className="flex gap-3 pt-2">
            <button onClick={() => setStep("select")}
              className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/20 text-foreground font-bold rounded-xl hover:border-foreground/40 transition-colors">
              Annuler
            </button>
            <button onClick={handleVote} disabled={!confirmChecked || isVoting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {isVoting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Vote en cours...</>
              ) : (
                <><Vote className="w-4 h-4" strokeWidth={3} /> Confirmer mon vote</>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
