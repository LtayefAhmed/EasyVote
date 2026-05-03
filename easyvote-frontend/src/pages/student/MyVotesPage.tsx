import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, BarChart3, CheckCircle2, Vote, Clock } from "lucide-react"
import { electionService } from "@/services/electionService"
import { voteService } from "@/services/voteService"
import { Skeleton } from "@/components/ui/skeleton"
import type { Election } from "@/types"
import { formatDateTimeFr } from "@/lib/date"

export default function MyVotesPage() {
  const navigate = useNavigate()
  const [votedElections, setVotedElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVotedElections = async () => {
      try {
        const allElections = await electionService.getAll()
        const visibleElections = allElections.filter(e => e.status !== "DRAFT")
        
        // Paralléliser les requêtes de statut de vote
        const statuses = await Promise.allSettled(
          visibleElections.map(e => voteService.getVoteStatus(e.id))
        )
        
        const voted: Election[] = []
        statuses.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value?.hasVoted) {
            voted.push(visibleElections[index])
          }
        })
        
        setVotedElections(voted)
      } catch (error) {
        console.error("Failed to fetch voted elections", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVotedElections()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            <span className="text-foreground/90">Mon </span>
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              Historique de Votes
            </span>
          </h1>
          <p className="text-foreground/60 max-w-2xl">
            Retrouvez toutes les élections auxquelles vous avez participé et consultez leurs résultats.
          </p>
        </div>
      </motion.section>

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence>
          {votedElections.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-foreground/5 border border-foreground/10 border-dashed rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-6">
                <Vote className="w-10 h-10 text-foreground/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Aucun vote pour l'instant</h3>
              <p className="text-foreground/50 max-w-sm mx-auto mb-8">
                Vous n'avez pas encore participé à une élection. Découvrez les élections en cours !
              </p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/elections")}
                className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-8 py-3 rounded-xl shadow-xl"
              >
                Voir les élections
              </motion.button>
            </motion.div>
          ) : (
            votedElections.map((election, i) => (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 transition-all hover:border-foreground/20"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {election.status === "VOTE_ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                          </span>
                          Vote en cours
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/10 text-foreground/60">
                          Terminée
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-foreground truncate mb-2">
                      {election.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-foreground/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 
                        Fin: {formatDateTimeFr(election.voteEnd)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/elections/${election.id}/results`)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
                    >
                      <BarChart3 className="w-4 h-4" strokeWidth={3} />
                      {election.status === "VOTE_ACTIVE" ? "Participation" : "Résultats"}
                    </button>
                    <button
                      onClick={() => navigate(`/elections/${election.id}`)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
