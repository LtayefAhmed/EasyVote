import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft, Download, Users, Vote, BarChart3, Trophy,
  TrendingUp, Activity, Zap, CheckCircle2,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { voteService, type PublicStats } from "@/services/voteService"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"
import { formatDateTimeFr } from "@/lib/date"
import { CountdownTimer } from "@/components/shared/CountdownTimer"
import { electionService } from "@/services/electionService"
import type { ElectionResultsResponse, ElectionStatsResponse, CandidateVoteResult, Election } from "@/types"

const CHART_COLORS = ["#6366f1", "#a855f7", "#ec4899", "#3b82f6", "#8b5cf6", "#f43f5e", "#14b8a6", "#f59e0b"]
const MEDAL = ["🥇", "🥈", "🥉"]

function useCountUp(end: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTime: number | null = null
    let frameId: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(eased * end))
      if (progress < 1) frameId = requestAnimationFrame(step)
    }
    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [end, duration])
  return count
}

function StatCard({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: number | string; gradient: string }) {
  const numVal = typeof value === "number" ? value : 0
  const animated = useCountUp(numVal)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 transition-all hover:border-foreground/20 hover:shadow-2xl">
      <div className="relative">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg", gradient)}>
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-4xl font-black text-foreground mb-1 tracking-tight">
          {typeof value === "number" ? animated.toLocaleString("fr-FR") : value}
        </div>
        <div className="text-sm text-foreground/60">{label}</div>
      </div>
    </motion.div>
  )
}

function RankCard({ result, index }: { result: CandidateVoteResult; index: number }) {
  const initials = result.fullName.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase()
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(result.percentage), 300); return () => clearTimeout(t) }, [result.percentage])
  const barGradient = result.rank === 1
    ? "from-indigo-500 via-violet-500 to-pink-500"
    : result.rank <= 3 ? "from-violet-500 to-pink-500" : "from-foreground/20 to-foreground/10"
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative overflow-hidden bg-foreground/5 border backdrop-blur-md rounded-2xl p-6 transition-all hover:border-foreground/20",
        result.rank === 1 ? "border-violet-400/30 shadow-lg shadow-violet-500/10" : "border-foreground/10"
      )}>
      {result.rank === 1 && <div className="absolute -inset-px rounded-2xl opacity-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 blur-xl pointer-events-none" />}
      <div className="relative flex items-center gap-5">
        <div className="flex-shrink-0 w-12 text-center">
          {result.rank <= 3 ? <span className="text-3xl">{MEDAL[result.rank - 1]}</span> : <span className="text-2xl font-black text-foreground/30">#{result.rank}</span>}
        </div>
        {result.photoUrl ? (
          <img src={result.photoUrl.startsWith("http") ? result.photoUrl : `http://localhost:8082${result.photoUrl}`}
            alt={result.fullName} className="w-14 h-14 rounded-full object-cover ring-2 ring-foreground/10 flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">{initials}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn("font-bold text-foreground truncate", result.rank === 1 ? "text-xl" : "text-lg")}>{result.fullName}</h3>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">{result.percentage.toFixed(1)}%</span>
              <span className="text-sm text-foreground/50 font-bold">{result.votes} votes</span>
            </div>
          </div>
          {result.slogan && <p className="text-xs text-foreground/50 italic truncate mb-3">« {result.slogan} »</p>}
          <div className="w-full h-2.5 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 + index * 0.1 }}
              className={cn("h-full rounded-full bg-gradient-to-r", barGradient)} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-background border border-border rounded-xl p-3 shadow-xl">
      <p className="text-foreground font-bold text-sm">{d.fullName || d.name}</p>
      <p className="text-foreground/70 text-xs">{d.votes ?? d.count ?? payload[0].value} votes · {d.percentage !== undefined ? `${d.percentage.toFixed(1)}%` : ""}</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// VOTE EN COURS VIEW (Student)
// ══════════════════════════════════════════════════════════════
function VoteEnCoursView({ electionId, election }: { electionId: number; election: Election | null }) {
  const navigate = useNavigate()
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null)
  const [voteStatus, setVoteStatus] = useState<{ hasVoted: boolean; canVote: boolean } | null>(null)

  const fetchPublicStats = useCallback(async () => {
    try {
      const s = await voteService.getPublicStats(electionId)
      setPublicStats(s)
    } catch {}
  }, [electionId])

  useEffect(() => {
    fetchPublicStats()
    voteService.getVoteStatus(electionId).then(setVoteStatus).catch(() => {})
    const interval = setInterval(fetchPublicStats, 10_000)
    return () => clearInterval(interval)
  }, [electionId, fetchPublicStats])

  const participationPct = publicStats?.participationRate ?? 0

  return (
    <div className="space-y-8">
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
        <div className="relative space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border-rose-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            🔴 LIVE — Vote en cours
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              {publicStats?.electionTitle ?? "Chargement..."}
            </span>
          </h1>
        </div>
      </motion.section>

      {/* Hero */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8 text-center">
        <Vote className="w-16 h-16 mx-auto text-violet-400/60 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-foreground mb-2">Vote en cours</h2>
        <p className="text-foreground/60 max-w-lg mx-auto mb-6">
          Les résultats détaillés seront disponibles à la clôture du vote. Suivez le taux de participation en direct.
        </p>
        {election && <CountdownTimer targetDate={new Date(election.voteEnd)} variant="block" />}
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Vote} label="Total des votes" value={publicStats?.totalVotes ?? 0} gradient="from-indigo-500 to-blue-600" />
        <StatCard icon={Users} label="Électeurs éligibles" value={publicStats?.totalEligibleVoters ?? 0} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={TrendingUp} label="Taux de participation" value={`${participationPct.toFixed(1)}%`} gradient="from-pink-500 to-rose-600" />
      </div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6">
        <div className="flex items-center justify-between text-sm text-foreground/60 mb-3">
          <span>Participation en direct</span>
          <span className="text-foreground font-bold text-lg">{participationPct.toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, participationPct)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 rounded-full" />
        </div>
      </motion.div>

      {/* CTA */}
      <div className="flex justify-center gap-4">
        {voteStatus && !voteStatus.hasVoted && voteStatus.canVote ? (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/elections/${electionId}/vote`)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5" strokeWidth={3} /> Voter maintenant
          </motion.button>
        ) : voteStatus?.hasVoted ? (
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold px-8 py-3.5 rounded-xl">
            <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} /> Vous avez voté ✓
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN RESULTS PAGE
// ══════════════════════════════════════════════════════════════
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const electionId = Number(id)
  const userRole = useAuthStore((s) => s.user?.role)

  const [results, setResults] = useState<ElectionResultsResponse | null>(null)
  const [stats, setStats] = useState<ElectionStatsResponse | null>(null)
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVoteActive, setIsVoteActive] = useState(false)
  const [chartTab, setChartTab] = useState<"bar" | "pie">("bar")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const data = await voteService.getResults(electionId)
      setResults(data)
      setIsVoteActive(data.status === "VOTE_ACTIVE")
    } catch { /* silent */ }
  }, [electionId])

  const fetchStats = useCallback(async () => {
    try {
      const data = await voteService.getLiveStats(electionId)
      setStats(data)
    } catch { /* silent */ }
  }, [electionId])

  useEffect(() => {
    if (!electionId || Number.isNaN(electionId)) { navigate("/elections"); return }
    setLoading(true)
    Promise.all([
      electionService.getById(electionId).catch(() => null),
      voteService.getResults(electionId).catch(() => null),
    ]).then(([el, res]) => {
      setElection(el)
      if (res) {
        setResults(res)
        setIsVoteActive(res.status === "VOTE_ACTIVE")
      } else {
        // If getResults failed (VOTE_ACTIVE for non-admin), check election status
        setIsVoteActive(el?.status === "VOTE_ACTIVE")
      }
    }).finally(() => setLoading(false))
  }, [electionId, navigate])

  // Auto-refresh for admin during VOTE_ACTIVE
  useEffect(() => {
    if (!results || userRole !== "ADMIN") return
    if (results.status === "VOTE_ACTIVE") {
      intervalRef.current = setInterval(fetchResults, 10_000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [results?.status, userRole, fetchResults])

  useEffect(() => {
    if (!results || userRole !== "ADMIN") return
    if (results.status === "VOTE_ACTIVE") {
      fetchStats()
      statsIntervalRef.current = setInterval(fetchStats, 5_000)
    }
    return () => { if (statsIntervalRef.current) clearInterval(statsIntervalRef.current) }
  }, [results?.status, userRole, fetchStats])

  const handleDownloadPdf = async () => {
    const toastId = toast.loading("Génération du PDF...")
    try {
      await voteService.downloadResultsPdf(electionId)
      toast.success("PDF téléchargé", { id: toastId })
    } catch {
      toast.error("Erreur lors du téléchargement", { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
      </div>
    )
  }

  // Non-admin during VOTE_ACTIVE → show limited view
  if (isVoteActive && userRole !== "ADMIN") {
    return <VoteEnCoursView electionId={electionId} election={election} />
  }

  if (!results) return null

  const barData = results.results.map((r) => ({ name: r.fullName.split(" ")[0], fullName: r.fullName, votes: r.votes, percentage: r.percentage }))
  const pieData = results.results.map((r) => ({ name: r.fullName.split(" ")[0], value: r.votes, percentage: r.percentage }))

  return (
    <div className="space-y-8">
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
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase",
              results.status === "VOTE_ACTIVE"
                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
            )}>
              {results.status === "VOTE_ACTIVE" && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
              {results.status === "VOTE_ACTIVE" ? "🔴 LIVE" : "🏆 Résultats finaux"}
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              <span className="text-foreground/90">Résultats — </span>
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">{results.electionTitle}</span>
            </h1>
            <p className="text-sm text-foreground/50">Mis à jour le {formatDateTimeFr(results.computedAt)}</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-violet-500/30 transition-all flex-shrink-0">
            <Download className="w-5 h-5" strokeWidth={2.5} /> Télécharger PDF
          </motion.button>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Vote} label="Total des votes" value={results.totalVotes} gradient="from-indigo-500 to-blue-600" />
        <StatCard icon={Users} label="Électeurs éligibles" value={results.totalEligibleVoters} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={TrendingUp} label="Taux de participation" value={`${results.participationRate.toFixed(1)}%`} gradient="from-pink-500 to-rose-600" />
      </div>

      {/* Ranking */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-foreground/40" strokeWidth={2.5} />
          <h2 className="text-xs font-black tracking-widest text-foreground/40 uppercase">Classement des candidats</h2>
        </div>
        <div className="space-y-3">
          {results.results.map((r, i) => <RankCard key={r.candidateId} result={r} index={i} />)}
        </div>
      </section>

      {/* Charts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-foreground/40" strokeWidth={2.5} />
            <h2 className="text-xs font-black tracking-widest text-foreground/40 uppercase">Graphiques</h2>
          </div>
          <div className="flex gap-1 bg-foreground/5 border border-foreground/10 rounded-xl p-1">
            {(["bar", "pie"] as const).map((t) => (
              <button key={t} onClick={() => setChartTab(t)}
                className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all",
                  chartTab === t ? "bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 text-foreground border border-foreground/10" : "text-foreground/50 hover:text-foreground"
                )}>
                {t === "bar" ? "Bar Chart" : "Pie Chart"}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6">
          {chartTab === "bar" ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#ffffff30" tick={{ fill: "#ffffff60", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" stroke="#ffffff30" tick={{ fill: "#ffffff80", fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="votes" radius={[0, 8, 8, 0]} maxBarSize={40}>
                  {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={120} innerRadius={60}
                  dataKey="value" label={({ name, percentage }: any) => `${name} (${percentage?.toFixed(1)}%)`}
                  labelLine={{ stroke: "#ffffff30" }} stroke="rgba(0,0,0,0.3)" strokeWidth={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#ffffff80", fontSize: 12, paddingTop: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Admin Stats */}
      {userRole === "ADMIN" && stats && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-foreground/40" strokeWidth={2.5} />
            <h2 className="text-xs font-black tracking-widest text-foreground/40 uppercase">Statistiques Live (Admin)</h2>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground/70">
                Votes dans la dernière heure : <span className="text-foreground font-bold text-lg">{stats.votesLastHour}</span>
              </p>
              <p className="text-xs text-foreground/40">Mis à jour le {formatDateTimeFr(stats.updatedAt)}</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="hour" stroke="#ffffff30" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <YAxis stroke="#ffffff30" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: "#a855f7", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      )}
    </div>
  )
}
