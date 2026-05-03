import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Plus, Trash2, BarChart3, ChevronRight, Vote,
  Users, Calendar, ArrowRight, Key, AlertTriangle, Pencil,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { electionService } from "@/services/electionService"
import { voteService } from "@/services/voteService"
import { cn } from "@/lib/utils"
import { formatDateTimeFr } from "@/lib/date"
import type { Election, ElectionStatus } from "@/types"

const statusMeta: Record<ElectionStatus, { label: string; className: string; pulse?: boolean }> = {
  DRAFT: { label: "Brouillon", className: "bg-foreground/5 text-foreground/70 border-foreground/20" },
  CAMPAIGN_ACTIVE: { label: "Campagne", className: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  VOTE_ACTIVE: { label: "Vote actif", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", pulse: true },
  CLOSED: { label: "Terminée", className: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
}

const STATUS_FLOW: ElectionStatus[] = ["DRAFT", "CAMPAIGN_ACTIVE", "VOTE_ACTIVE", "CLOSED"]
function nextStatus(current: ElectionStatus): ElectionStatus | null {
  const idx = STATUS_FLOW.indexOf(current)
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
}

const emptyElection = { title: "", description: "", campaignStart: "", campaignEnd: "", voteStart: "", voteEnd: "" }

export default function ManageElectionsPage() {
  const navigate = useNavigate()
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [showTokens, setShowTokens] = useState(false)
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)
  const [form, setForm] = useState(emptyElection)
  const [submitting, setSubmitting] = useState(false)

  const loadElections = async () => {
    try {
      const data = await electionService.getAll()
      setElections(data)
    } catch { toast.error("Impossible de charger les élections") }
    finally { setLoading(false) }
  }

  useEffect(() => { loadElections() }, [])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      await electionService.create(form as any)
      toast.success("Élection créée !")
      setShowCreate(false)
      setForm(emptyElection)
      loadElections()
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.validationErrors && Object.keys(data.validationErrors).length > 0) {
        toast.error(`Erreur : ${Object.values(data.validationErrors)[0]}`);
      } else {
        toast.error(data?.message || "Erreur");
      }
    } finally { setSubmitting(false) }
  }

  const handleEdit = async () => {
    if (!selectedElection) return
    setSubmitting(true)
    try {
      await electionService.update(selectedElection.id, form as any)
      toast.success("Élection modifiée !")
      setShowEdit(false)
      loadElections()
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.validationErrors && Object.keys(data.validationErrors).length > 0) {
        toast.error(`Erreur : ${Object.values(data.validationErrors)[0]}`);
      } else {
        toast.error(data?.message || "Erreur");
      }
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!selectedElection) return
    setSubmitting(true)
    try {
      await electionService.delete(selectedElection.id)
      toast.success("Élection supprimée !")
      setShowDelete(false)
      loadElections()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur")
    } finally { setSubmitting(false) }
  }

  const handleStatusChange = async () => {
    if (!selectedElection) return
    const next = nextStatus(selectedElection.status)
    if (!next) return
    setSubmitting(true)
    try {
      await electionService.updateStatus(selectedElection.id, next)
      toast.success(`Statut changé → ${statusMeta[next].label}`)
      setShowStatusChange(false)
      loadElections()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur")
    } finally { setSubmitting(false) }
  }

  const handleGenerateTokens = async () => {
    if (!selectedElection) return
    setSubmitting(true)
    try {
      await voteService.generateTokens(selectedElection.id)
      toast.success("Tokens générés avec succès !")
      setShowTokens(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur")
    } finally { setSubmitting(false) }
  }

  const openEdit = (e: Election) => {
    setSelectedElection(e)
    setForm({
      title: e.title, description: e.description,
      campaignStart: e.campaignStart?.slice(0, 16) || "",
      campaignEnd: e.campaignEnd?.slice(0, 16) || "",
      voteStart: e.voteStart?.slice(0, 16) || "",
      voteEnd: e.voteEnd?.slice(0, 16) || "",
    })
    setShowEdit(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    )
  }



  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">Gestion des élections</span>
        </h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setForm(emptyElection); setShowCreate(true) }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-violet-500/30">
          <Plus className="w-4 h-4" strokeWidth={3} /> Créer
        </motion.button>
      </motion.div>

      {/* Elections list */}
      {elections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 mb-4">
            <Vote className="w-10 h-10 text-violet-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Aucune élection</h3>
          <p className="text-foreground/50 text-sm">Commencez par créer votre première élection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {elections.map((election, i) => {
            const meta = statusMeta[election.status]
            const next = nextStatus(election.status)
            return (
              <motion.div key={election.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 hover:border-foreground/20 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase", meta.className)}>
                        {meta.pulse && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>}
                        {meta.label}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1 truncate">{election.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/50">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {election.totalCandidates} candidats</span>
                      <span className="flex items-center gap-1"><Vote className="w-3 h-3" /> {election.totalVotes} votes</span>
                      {election.voteEnd && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTimeFr(election.voteEnd)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    {next && (
                      <button onClick={() => { setSelectedElection(election); setShowStatusChange(true) }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-xs font-bold text-foreground hover:border-foreground/30 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" /> → {statusMeta[next].label}
                      </button>
                    )}
                    {(election.status === "CAMPAIGN_ACTIVE" || election.status === "VOTE_ACTIVE") && (
                      <button onClick={() => { setSelectedElection(election); setShowTokens(true) }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300 hover:border-emerald-400/40 transition-colors">
                        <Key className="w-3.5 h-3.5" /> Tokens
                      </button>
                    )}
                    <button onClick={() => openEdit(election)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-xs font-bold text-foreground hover:border-foreground/30 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => navigate(`/elections/${election.id}/results`)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-xs font-bold text-foreground hover:border-foreground/30 transition-colors">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </button>
                    {election.status === "DRAFT" && (
                      <button onClick={() => { setSelectedElection(election); setShowDelete(true) }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-300 hover:border-rose-400/40 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-background border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Créer une élection</DialogTitle>
            <DialogDescription className="text-foreground/60">Remplissez les informations de la nouvelle élection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-foreground/70 font-semibold mb-1 block">Titre</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder-foreground/30 focus:border-violet-400/50 focus:outline-none transition" placeholder="Nom de l'élection" />
            </div>
            <div>
              <label className="text-sm text-foreground/70 font-semibold mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder-foreground/30 focus:border-violet-400/50 focus:outline-none transition resize-none" placeholder="Description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Début campagne</label>
                <input type="datetime-local" value={form.campaignStart} onChange={(e) => setForm({ ...form, campaignStart: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Fin campagne</label>
                <input type="datetime-local" value={form.campaignEnd} onChange={(e) => setForm({ ...form, campaignEnd: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Début vote</label>
                <input type="datetime-local" value={form.voteStart} onChange={(e) => setForm({ ...form, voteStart: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Fin vote</label>
                <input type="datetime-local" value={form.voteEnd} onChange={(e) => setForm({ ...form, voteEnd: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-bold rounded-xl">Annuler</button>
            <button onClick={handleCreate} disabled={submitting || !form.title}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <span className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full animate-spin" /> : <Plus className="w-4 h-4" />} Créer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-background border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Modifier l'élection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-foreground/70 font-semibold mb-1 block">Titre</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder-foreground/30 focus:border-violet-400/50 focus:outline-none transition" placeholder="Nom de l'élection" />
            </div>
            <div>
              <label className="text-sm text-foreground/70 font-semibold mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder-foreground/30 focus:border-violet-400/50 focus:outline-none transition resize-none" placeholder="Description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Début campagne</label>
                <input type="datetime-local" value={form.campaignStart} onChange={(e) => setForm({ ...form, campaignStart: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Fin campagne</label>
                <input type="datetime-local" value={form.campaignEnd} onChange={(e) => setForm({ ...form, campaignEnd: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Début vote</label>
                <input type="datetime-local" value={form.voteStart} onChange={(e) => setForm({ ...form, voteStart: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs text-foreground/50 font-semibold mb-1 block">Fin vote</label>
                <input type="datetime-local" value={form.voteEnd} onChange={(e) => setForm({ ...form, voteEnd: e.target.value })}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-foreground text-sm focus:border-violet-400/50 focus:outline-none transition" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3 pt-2">
            <button onClick={() => setShowEdit(false)} className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-bold rounded-xl">Annuler</button>
            <button onClick={handleEdit} disabled={submitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <span className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full animate-spin" /> : <Pencil className="w-4 h-4" />} Enregistrer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="bg-background border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-400" /> Supprimer</DialogTitle>
            <DialogDescription className="text-foreground/60">
              Supprimer définitivement « {selectedElection?.title} » ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-2">
            <button onClick={() => setShowDelete(false)} className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-bold rounded-xl">Annuler</button>
            <button onClick={handleDelete} disabled={submitting}
              className="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <span className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />} Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirm */}
      <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
        <DialogContent className="bg-background border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Changer le statut</DialogTitle>
            <DialogDescription className="text-foreground/60">
              {selectedElection && nextStatus(selectedElection.status) && (
                <>Passer « {selectedElection.title} » de <strong className="text-foreground">{statusMeta[selectedElection.status].label}</strong> à <strong className="text-foreground">{statusMeta[nextStatus(selectedElection.status)!].label}</strong> ?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-2">
            <button onClick={() => setShowStatusChange(false)} className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-bold rounded-xl">Annuler</button>
            <button onClick={handleStatusChange} disabled={submitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <span className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />} Confirmer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tokens Dialog */}
      <Dialog open={showTokens} onOpenChange={setShowTokens}>
        <DialogContent className="bg-background border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2"><Key className="w-5 h-5 text-emerald-400" /> Générer les tokens</DialogTitle>
            <DialogDescription className="text-foreground/60">
              Générer les tokens de vote pour « {selectedElection?.title} » ? Cela permettra aux électeurs éligibles de voter.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-2">
            <button onClick={() => setShowTokens(false)} className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 text-foreground font-bold rounded-xl">Annuler</button>
            <button onClick={handleGenerateTokens} disabled={submitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <span className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full animate-spin" /> : <Key className="w-4 h-4" />} Générer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
