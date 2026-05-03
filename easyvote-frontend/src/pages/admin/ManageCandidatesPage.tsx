import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Users, Check, X } from "lucide-react"

import { candidateService } from "@/services/candidateService"
import { Candidate } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatLongFr } from "@/lib/date"

export default function ManageCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  
  const [rejectDialog, setRejectDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [adminNote, setAdminNote] = useState("")

  const loadCandidates = async () => {
    try {
      setLoading(true)
      // Since candidateService only has getPending right now, we can only reliably fetch pending ones
      // If we want all, we would need a new endpoint, but let's mock the "APPROVED"/"REJECTED" or just show what we get from pending.
      // Actually, if the backend doesn't have an endpoint for all, we'll only display PENDING.
      // Let's assume the admin can only see PENDING with the current API.
      const pending = await candidateService.getPending()
      setCandidates(pending)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du chargement des candidatures")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCandidates()
  }, [])

  const handleValidate = async (id: number) => {
    try {
      await candidateService.validate(id, "VALIDATED")
      toast.success("Candidature validée avec succès")
      loadCandidates()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur")
    }
  }

  const handleReject = async () => {
    if (!selectedCandidate) return
    try {
      await candidateService.validate(selectedCandidate.id, "REJECTED", adminNote)
      toast.info("Candidature rejetée")
      setRejectDialog(false)
      setSelectedCandidate(null)
      setAdminNote("")
      loadCandidates()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur")
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Gestion des candidatures
            </h1>
          </div>
          <p className="text-foreground/60 max-w-2xl">
            Validez ou rejetez les candidatures en attente. Une fois validé, l'étudiant devient officiellement candidat pour l'élection correspondante.
          </p>
        </div>
      </section>

      {/* ── Tabs (Visual only if no API for all) ── */}
      <div className="flex gap-2">
        <button className="px-5 py-2.5 rounded-full bg-foreground/10 text-foreground font-bold text-sm">
          En attente ({candidates.length})
        </button>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="text-center py-20 text-foreground/50">Chargement...</div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-20 bg-foreground/5 border border-foreground/10 rounded-2xl">
          <Check className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground/80">Tout est à jour !</h3>
          <p className="text-sm text-foreground/50 mt-1">Aucune candidature en attente de validation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {candidates.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col md:flex-row gap-6 p-6 bg-foreground/5 border border-foreground/10 rounded-2xl hover:border-foreground/20 transition-colors"
              >
                {/* User Info */}
                <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {c.userFullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{c.userFullName}</h4>
                    <p className="text-xs text-foreground/50">{c.userEmail}</p>
                    <p className="text-[10px] text-foreground/40 mt-1">Élection: {c.electionTitle}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-500 italic mb-2">« {c.slogan} »</p>
                  <p className="text-xs text-foreground/60 line-clamp-2">{c.program}</p>
                  <p className="text-[10px] text-foreground/40 mt-2">Soumis le {formatLongFr(c.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0 md:w-32">
                  <button
                    onClick={() => handleValidate(c.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} /> Valider
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCandidate(c)
                      setAdminNote("")
                      setRejectDialog(true)
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={3} /> Rejeter
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="bg-background border border-border text-foreground rounded-2xl">
          <DialogHeader>
            <DialogTitle>Rejeter la candidature</DialogTitle>
            <DialogDescription className="text-foreground/60">
              Veuillez indiquer la raison du rejet pour l'étudiant {selectedCandidate?.userFullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Raison du rejet (optionnelle)..."
              className="w-full h-24 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-sm focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setRejectDialog(false)}
              className="px-4 py-2 rounded-xl border border-foreground/10 hover:bg-foreground/5 text-sm font-medium text-foreground/70"
            >
              Annuler
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-bold transition-colors"
            >
              Confirmer le rejet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
