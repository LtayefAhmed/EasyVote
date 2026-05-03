import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Vote,
  Users,
  Calendar,
  ArrowRight,
  Inbox,
  Megaphone,
  Lock,
  Sparkles,
  Search,
} from "lucide-react"

import { electionService } from "@/services/electionService"
import { Election, ElectionStatus } from "@/types"
import { CountdownTimer } from "@/components/shared/CountdownTimer"
import { Skeleton } from "@/components/ui/skeleton"
import { formatShortFr } from "@/lib/date"
import { cn } from "@/lib/utils"

type FilterKey = "all" | "campaign" | "vote" | "closed"

const filters: { key: FilterKey; label: string; icon: typeof Sparkles }[] = [
  { key: "all", label: "Toutes", icon: Sparkles },
  { key: "campaign", label: "Campagne", icon: Megaphone },
  { key: "vote", label: "Vote en cours", icon: Vote },
  { key: "closed", label: "Terminées", icon: Lock },
]

const statusMeta: Record<
  ElectionStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-foreground/10 text-foreground/70 border-foreground/20",
  },
  CAMPAIGN_ACTIVE: {
    label: "Campagne",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  VOTE_ACTIVE: {
    label: "Vote en cours",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    pulse: true,
  },
  CLOSED: {
    label: "Terminée",
    className: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
}

function StatusBadge({ status }: { status: ElectionStatus }) {
  const meta = statusMeta[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider uppercase",
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

function ElectionCardSkeleton() {
  return (
    <div className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

function ElectionCard({ election, index }: { election: Election; index: number }) {
  const navigate = useNavigate()
  const isVoting = election.status === "VOTE_ACTIVE"
  const voteEnd = new Date(election.voteEnd)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/elections/${election.id}`)}
      className="group relative cursor-pointer overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-2xl hover:shadow-violet-500/10"
    >
      {/* Halo gradient au hover */}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 blur-xl pointer-events-none" />

      <div className="relative space-y-4">
        {/* Header : titre + status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:via-violet-400 group-hover:to-pink-400 transition-all">
            {election.title}
          </h3>
          <div className="shrink-0">
            <StatusBadge status={election.status} />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/60 line-clamp-2 min-h-[2.5rem]">
          {election.description}
        </p>

        {/* Stats inline */}
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5 text-foreground/70">
            <Users className="w-4 h-4 text-violet-400" strokeWidth={2.5} />
            <span className="text-foreground font-bold">{election.totalCandidates}</span>
            <span className="text-foreground/50">candidats</span>
          </div>
          <div className="w-px h-4 bg-foreground/10" />
          <div className="flex items-center gap-1.5 text-foreground/70">
            <Vote className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
            <span className="text-foreground font-bold">
              {election.totalVotes.toLocaleString("fr-FR")}
            </span>
            <span className="text-foreground/50">votes</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>
            {formatShortFr(election.campaignStart)} → {formatShortFr(election.voteEnd)}
          </span>
        </div>

        {/* Countdown si vote actif */}
        {isVoting && (
          <div className="pt-1">
            <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2 font-semibold">
              Vote se termine dans
            </div>
            <CountdownTimer targetDate={voteEnd} />
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          className="group/btn w-full mt-2 inline-flex items-center justify-center gap-2 bg-foreground/5 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:via-violet-500/10 hover:to-pink-500/10 border border-foreground/10 hover:border-foreground/30 text-foreground font-semibold py-2.5 rounded-xl transition-all"
        >
          <span>Voir détails</span>
          <ArrowRight
            className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
            strokeWidth={2.5}
          />
        </button>
      </div>
    </motion.div>
  )
}

export default function ElectionsListPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    let mounted = true
    setLoading(true)
    electionService
      .getAll()
      .then((data) => {
        if (mounted) setElections(data ?? [])
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message ?? "Impossible de charger les élections"
        )
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    let list = elections
    if (filter === "campaign") list = list.filter((e) => e.status === "CAMPAIGN_ACTIVE")
    else if (filter === "vote") list = list.filter((e) => e.status === "VOTE_ACTIVE")
    else if (filter === "closed") list = list.filter((e) => e.status === "CLOSED")

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      )
    }
    return list
  }, [elections, filter, search])

  const counts = useMemo(
    () => ({
      all: elections.length,
      campaign: elections.filter((e) => e.status === "CAMPAIGN_ACTIVE").length,
      vote: elections.filter((e) => e.status === "VOTE_ACTIVE").length,
      closed: elections.filter((e) => e.status === "CLOSED").length,
    }),
    [elections]
  )

  return (
    <div className="space-y-8">
      {/* ═════ Header ═════ */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            Élections
          </span>
        </h1>
        <p className="text-base md:text-lg text-foreground/60 max-w-2xl">
          Découvrez les scrutins en cours et passés, suivez les campagnes et exprimez votre voix.
        </p>
      </motion.header>

      {/* ═════ Filtres + recherche ═════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between"
      >
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const Icon = f.icon
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                  active
                    ? "bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 border-foreground/30 text-foreground shadow-lg shadow-violet-500/10"
                    : "bg-foreground/5 border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
                <span>{f.label}</span>
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    active ? "bg-foreground/20 text-foreground" : "bg-foreground/10 text-foreground/60"
                  )}
                >
                  {counts[f.key]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" strokeWidth={2.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une élection…"
            className="w-full pl-10 pr-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 focus:bg-foreground/10 transition-all"
          />
        </div>
      </motion.div>

      {/* ═════ Grid ═════ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ElectionCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 mb-5">
            <Inbox className="w-12 h-12 text-violet-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Aucune élection</h3>
          <p className="text-foreground/50 max-w-md">
            {search.trim()
              ? "Aucun résultat pour cette recherche. Essayez un autre terme."
              : "Aucune élection dans cette catégorie pour l'instant. Revenez plus tard."}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((election, i) => (
              <ElectionCard key={election.id} election={election} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
