import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { electionService } from "@/services/electionService";
import { voteService } from "@/services/voteService";
import { candidateService } from "@/services/candidateService";
import { notificationService } from "@/services/notificationService";
import type { Election, AppNotification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import {
  Vote,
  CheckCircle,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  HelpCircle,

  CheckSquare,
  BarChart3,
  Settings,
  UserCheck,
  Megaphone,
  ArrowRight,
  ArrowUp,
  Calendar,
  Clock,

  Sparkles,
  Activity,
  Zap,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
type UserRole = "STUDENT" | "CANDIDATE" | "ADMIN";

interface User {
  fullName: string;
  role: UserRole;
  email: string;
}

interface Stats {
  totalElections: number;
  activeElections: number;
  totalVotes: number;
  participation: number;
  myVotes?: number;
  totalCandidates: number;
}

interface ActiveElection {
  id: string;
  title: string;
  description?: string;
  voteEnd: Date;
  totalCandidates: number;
  totalVotes?: number;
  hasVoted: boolean;
}

interface DashboardProps {
  user?: User;
  stats?: Stats;
  activeElection?: ActiveElection | null;
}

interface StatCard {
  icon: LucideIcon;
  value: string;
  numericValue: number;
  suffix?: string;
  label: string;
  trend: string;
  trendUp: boolean;
  gradient: string;
  iconBg: string;
}

interface QuickAction {
  icon: LucideIcon;
  title: string;
  desc: string;
  link: string;
  gradient: string;
}

interface ActivityItem {
  icon: LucideIcon;
  text: string;
  timestamp: string;
  color: string;
}

// (defaults removed — real data fetched from API + authStore)

// ═══════════════════════════════════════════════════
// HOOK : COUNT-UP ANIMATION
// ═══════════════════════════════════════════════════
const useCountUp = (end: number, duration: number = 1500, start: number = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const nextCount = Math.floor(eased * (end - start) + start);
      setCount(nextCount);
      
      if (progress < 1 && nextCount !== end) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, start]);

  return count;
};



// ═══════════════════════════════════════════════════
// FORMATEUR DATE FRANÇAISE
// ═══════════════════════════════════════════════════
const formatFrenchDate = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(/^./, (c) => c.toUpperCase());
};

// ═══════════════════════════════════════════════════
// SOUS-COMPOSANT : STAT CARD
// ═══════════════════════════════════════════════════
const StatCardComponent = React.memo(({ stat, delay }: { stat: StatCard; delay: number }) => {
  const animated = useCountUp(stat.numericValue, 1500);
  const Icon = stat.icon;

  // Affichage selon le suffixe (% ou K)
  const displayValue =
    stat.suffix === "%"
      ? `${animated}%`
      : stat.suffix === "K"
        ? `${(animated / 1000).toFixed(1)}K`
        : animated.toLocaleString("fr-FR");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-2xl"
      style={{
        // Glow personnalisé au hover via box-shadow
      }}
    >
      {/* Halo de gradient subtil au hover */}
      <div
        className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${stat.gradient} blur-xl pointer-events-none`}
      />

      <div className="relative">
        {/* Icone gradient */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center mb-4 shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>

        {/* Valeur animée */}
        <div className="text-4xl font-black text-foreground mb-1 tracking-tight">{displayValue}</div>

        {/* Label */}
        <div className="text-sm text-foreground/60 mb-3">{stat.label}</div>

        {/* Tendance */}
        <div className="flex items-center gap-1.5 text-xs">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${stat.trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
          >
            <ArrowUp className={`w-3 h-3 ${!stat.trendUp && "rotate-180"}`} strokeWidth={3} />
            <span className="font-semibold">{stat.trend}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});



// ═══════════════════════════════════════════════════
// SOUS-COMPOSANT : QUICK ACTION CARD
// ═══════════════════════════════════════════════════
const QuickActionCard = React.memo(({ action, delay }: { action: QuickAction; delay: number }) => {
  const Icon = action.icon;

  return (
    <motion.a
      href={action.link}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ x: 4 }}
      className="group relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-foreground/20 cursor-pointer block"
    >
      {/* Bordure gauche gradient au hover */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-bold text-lg mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:via-violet-400 group-hover:to-pink-400 transition-all duration-300">
            {action.title}
          </h3>
          <p className="text-sm text-foreground/60">{action.desc}</p>
        </div>

        <ArrowRight
          className="w-5 h-5 text-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-2"
          strokeWidth={2.5}
        />
      </div>
    </motion.a>
  );
});

// ═══════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : DASHBOARD
// ═══════════════════════════════════════════════════
const EasyVoteDashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  // ─── Real user from authStore ───
  const authUser = useAuthStore((s) => s.user);
  const user: User = {
    fullName: authUser?.fullName ?? "Utilisateur",
    role: (authUser?.role ?? "STUDENT") as UserRole,
    email: authUser?.email ?? "",
  };

  // ─── Fetch live data from API ───
  const [stats, setStats] = useState<Stats>({ totalElections: 0, activeElections: 0, totalVotes: 0, participation: 0, myVotes: 0, totalCandidates: 0 });
  const [activeElection, setActiveElection] = useState<ActiveElection | null>(null);
  const [recentNotifs, setRecentNotifs] = useState<AppNotification[]>([]);
  const [candidateStats, setCandidateStats] = useState({ likes: 0, comments: 0, questions: 0 });

  const fetchData = useCallback(async () => {
    try {
      const [allElections, activeElections] = await Promise.all([
        electionService.getAll().catch(() => [] as Election[]),
        electionService.getActive().catch(() => [] as Election[]),
      ]);
      const totalVotes = allElections.reduce((s, e) => s + (e.totalVotes || 0), 0);
      const totalCandidates = allElections.reduce((s, e) => s + (e.totalCandidates || 0), 0);
      let hasVotedAny = false;
      
      const voteActive = activeElections.find((e) => e.status === "VOTE_ACTIVE");
      if (voteActive && authUser?.role === "STUDENT") {
        try {
          const vStatus = await voteService.getVoteStatus(voteActive.id);
          hasVotedAny = vStatus.hasVoted;
        } catch { /* ignore */ }
      }

      setStats({
        totalElections: allElections.length,
        activeElections: activeElections.length,
        totalVotes,
        participation: allElections.length > 0 ? Math.round((totalVotes / Math.max(1, allElections.length * 50)) * 100) : 0,
        myVotes: hasVotedAny ? 1 : 0,
        totalCandidates,
      });

      // Find first vote-active election
      if (voteActive) {
        let hasVoted = false;
        try {
          const vStatus = await voteService.getVoteStatus(voteActive.id);
          hasVoted = vStatus.hasVoted;
        } catch { /* token may not exist yet */ }
        setActiveElection({
          id: String(voteActive.id),
          title: voteActive.title,
          description: voteActive.description,
          voteEnd: new Date(voteActive.voteEnd),
          totalCandidates: voteActive.totalCandidates,
          totalVotes: voteActive.totalVotes,
          hasVoted,
        });
      } else {
        setActiveElection(null);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchData() }, [fetchData]);

  // ─── Fetch recent notifications ───
  useEffect(() => {
    notificationService.getAll()
      .then((notifs) => setRecentNotifs(notifs.slice(0, 5)))
      .catch(() => {});
  }, []);

  // ─── Fetch candidate stats (only for CANDIDATE role) ───
  useEffect(() => {
    if (user.role !== "CANDIDATE") return;
    const loadCandidateStats = async () => {
      try {
        const activeElections = await electionService.getActive().catch(() => [] as Election[]);
        const target = activeElections.find(e => e.status === "CAMPAIGN_ACTIVE" || e.status === "VOTE_ACTIVE");
        if (!target) return;
        const candidacy = await candidateService.getMyCandidacy(target.id);
        setCandidateStats({
          likes: candidacy.likesCount || 0,
          comments: candidacy.commentsCount || 0,
          questions: candidacy.questionsCount || 0,
        });
      } catch {}
    };
    loadCandidateStats();
  }, [user.role]);



  // ─── Sous-titres dynamiques selon le rôle ───
  const subtitles: Record<UserRole, string> = {
    STUDENT: "Votre voix compte. Découvrez les élections en cours.",
    CANDIDATE: "Votre campagne est en route. Engagez votre communauté.",
    ADMIN: "Pilotez la démocratie étudiante depuis votre poste de commande.",
  };

  // ─── Stats cards selon le rôle ───
  const statsCards: Record<UserRole, StatCard[]> = {
    STUDENT: [
      {
        icon: Vote,
        value: String(stats.activeElections),
        numericValue: stats.activeElections,
        label: "Élections actives",
        trend: "En ce moment",
        trendUp: true,
        gradient: "from-indigo-500 to-blue-500",
        iconBg: "from-indigo-500 to-blue-600",
      },
      {
        icon: CheckCircle,
        value: String(stats.myVotes ?? 0),
        numericValue: stats.myVotes ?? 0,
        label: "Votes effectués",
        trend: "Félicitations",
        trendUp: true,
        gradient: "from-emerald-500 to-green-500",
        iconBg: "from-emerald-500 to-green-600",
      },
      {
        icon: Users,
        value: String(stats.totalCandidates),
        numericValue: stats.totalCandidates,
        label: "Candidats à découvrir",
        trend: "Tous les profils",
        trendUp: true,
        gradient: "from-violet-500 to-purple-500",
        iconBg: "from-violet-500 to-purple-600",
      },
      {
        icon: TrendingUp,
        value: `${stats.participation}%`,
        numericValue: stats.participation,
        suffix: "%",
        label: "Taux de participation",
        trend: "Global",
        trendUp: true,
        gradient: "from-pink-500 to-rose-500",
        iconBg: "from-pink-500 to-rose-600",
      },
    ],
    CANDIDATE: [
      {
        icon: Heart,
        value: String(candidateStats.likes),
        numericValue: candidateStats.likes,
        label: "Likes reçus",
        trend: "Total",
        trendUp: true,
        gradient: "from-pink-500 to-rose-500",
        iconBg: "from-pink-500 to-rose-600",
      },
      {
        icon: MessageCircle,
        value: String(candidateStats.comments),
        numericValue: candidateStats.comments,
        label: "Commentaires",
        trend: "Engagement",
        trendUp: true,
        gradient: "from-indigo-500 to-blue-500",
        iconBg: "from-indigo-500 to-blue-600",
      },
      {
        icon: HelpCircle,
        value: String(candidateStats.questions),
        numericValue: candidateStats.questions,
        label: "Questions ouvertes",
        trend: candidateStats.questions > 0 ? "À répondre" : "Tout à jour",
        trendUp: candidateStats.questions === 0,
        gradient: "from-amber-500 to-orange-500",
        iconBg: "from-amber-500 to-orange-600",
      },
      {
        icon: TrendingUp,
        value: `${stats.participation}%`,
        numericValue: stats.participation,
        suffix: "%",
        label: "Participation globale",
        trend: "Élections en cours",
        trendUp: true,
        gradient: "from-violet-500 to-purple-500",
        iconBg: "from-violet-500 to-purple-600",
      },
    ],
    ADMIN: [
      {
        icon: Vote,
        value: String(stats.totalElections),
        numericValue: stats.totalElections,
        label: "Élections totales",
        trend: "Depuis toujours",
        trendUp: true,
        gradient: "from-indigo-500 to-blue-500",
        iconBg: "from-indigo-500 to-blue-600",
      },
      {
        icon: Users,
        value: String(stats.totalCandidates),
        numericValue: stats.totalCandidates,
        label: "Candidats totaux",
        trend: "Approuvés",
        trendUp: true,
        gradient: "from-violet-500 to-purple-500",
        iconBg: "from-violet-500 to-purple-600",
      },
      {
        icon: CheckSquare,
        value: String(stats.totalVotes),
        numericValue: stats.totalVotes,
        label: "Votes comptabilisés",
        trend: "Total global",
        trendUp: true,
        gradient: "from-emerald-500 to-green-500",
        iconBg: "from-emerald-500 to-green-600",
      },
      {
        icon: BarChart3,
        value: `${stats.participation}%`,
        numericValue: stats.participation,
        suffix: "%",
        label: "Participation moyenne",
        trend: "Tous confondu",
        trendUp: true,
        gradient: "from-pink-500 to-rose-500",
        iconBg: "from-pink-500 to-rose-600",
      },
    ],
  };

  // ─── Quick actions selon le rôle ───
  const quickActions: Record<UserRole, QuickAction[]> = {
    STUDENT: [
      {
        icon: Vote,
        title: "Voter",
        desc: "Élections en cours",
        link: "/elections",
        gradient: "from-indigo-500 to-blue-500",
      },
      {
        icon: Users,
        title: "Candidats",
        desc: "Découvrir les programmes",
        link: "/elections",
        gradient: "from-violet-500 to-purple-500",
      },
      {
        icon: BarChart3,
        title: "Résultats",
        desc: "Suivre les statistiques",
        link: "/elections",
        gradient: "from-pink-500 to-rose-500",
      },
    ],
    CANDIDATE: [
      {
        icon: Megaphone,
        title: "Ma campagne",
        desc: "Gérer mon programme",
        link: "/my-campaign",
        gradient: "from-indigo-500 to-blue-500",
      },
      {
        icon: MessageCircle,
        title: "Messages",
        desc: "Répondre aux questions",
        link: "/my-campaign",
        gradient: "from-violet-500 to-purple-500",
      },
      {
        icon: BarChart3,
        title: "Engagement",
        desc: "Stats de ma campagne",
        link: "/my-campaign",
        gradient: "from-pink-500 to-rose-500",
      },
    ],
    ADMIN: [
      {
        icon: Settings,
        title: "Élections",
        desc: "Créer / gérer",
        link: "/admin/elections",
        gradient: "from-indigo-500 to-blue-500",
      },
      {
        icon: UserCheck,
        title: "Candidatures",
        desc: "Valider les candidats",
        link: "/admin/candidates",
        gradient: "from-violet-500 to-purple-500",
      },
      {
        icon: Users,
        title: "Étudiants",
        desc: "Importer / gérer",
        link: "/admin/students",
        gradient: "from-pink-500 to-rose-500",
      },
    ],
  };

  // ─── Activité récente (from real notifications) ───
  const notifColorMap: Record<string, string> = {
    CAMPAIGN_STARTED: "from-indigo-500 to-blue-500",
    VOTE_STARTED: "from-emerald-500 to-green-500",
    VOTE_ENDED: "from-orange-500 to-red-500",
    CANDIDATE_VALIDATED: "from-violet-500 to-purple-500",
    NEW_COMMENT: "from-blue-500 to-cyan-500",
    NEW_QUESTION: "from-amber-500 to-orange-500",
    QUESTION_ANSWERED: "from-pink-500 to-rose-500",
    RESULTS_PUBLISHED: "from-purple-500 to-pink-500",
  };
  const notifIconMap: Record<string, typeof Vote> = {
    CAMPAIGN_STARTED: Megaphone,
    VOTE_STARTED: Vote,
    VOTE_ENDED: Vote,
    CANDIDATE_VALIDATED: UserCheck,
    NEW_COMMENT: MessageCircle,
    NEW_QUESTION: HelpCircle,
    QUESTION_ANSWERED: Sparkles,
    RESULTS_PUBLISHED: BarChart3,
  };
  const recentActivity: ActivityItem[] = recentNotifs.length > 0
    ? recentNotifs.map(n => ({
        icon: notifIconMap[n.type] || Activity,
        text: n.title + (n.content ? " — " + n.content : ""),
        timestamp: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr }),
        color: notifColorMap[n.type] || "from-gray-500 to-gray-600",
      }))
    : [
        {
          icon: Activity,
          text: "Aucune activité récente. Connectez-vous régulièrement pour suivre les élections.",
          timestamp: "",
          color: "from-white/10 to-white/5",
        },
      ];

  const cards = statsCards[user.role];
  const actions = quickActions[user.role];

  return (
    <div className="w-full text-foreground font-[Inter,system-ui,sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ═════ SECTION 1 : WELCOME HEADER ═════ */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8"
        >
          {/* Gradient overlay décoratif (sans blur CSS lourd) */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-[64px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Bloc gauche */}
            <div className="flex-1 min-w-0">
              {/* Date du jour */}
              <div className="flex items-center gap-2 text-sm text-foreground/50 mb-3">
                <Calendar className="w-4 h-4" strokeWidth={2.5} />
                <span className="font-medium">{formatFrenchDate(new Date())}</span>
              </div>

              {/* Titre gradient */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 leading-[1.05]">
                <span className="text-foreground/90">Bienvenue, </span>
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                  {user.fullName}
                </span>
              </h1>

              {/* Sous-titre selon role */}
              <p className="text-base md:text-lg text-foreground/60 max-w-2xl">{subtitles[user.role]}</p>
            </div>

            {/* Bloc droite : badge dynamique selon role */}
            <div className="flex-shrink-0">
              {user.role === "STUDENT" && activeElection && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="relative flex flex-col items-end gap-2 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-pink-500/10 border border-foreground/10 rounded-2xl px-5 py-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span className="text-xs font-black tracking-widest text-foreground uppercase">
                      Vote en cours
                    </span>
                  </div>
                  <div className="text-sm text-foreground/70 flex items-center gap-1">
                    Se termine dans <CountdownTimer targetDate={activeElection.voteEnd} variant="inline" />
                  </div>
                </motion.div>
              )}

              {user.role === "CANDIDATE" && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-3 bg-gradient-to-br from-pink-500/10 via-violet-500/10 to-indigo-500/10 border border-foreground/10 rounded-2xl px-5 py-4 backdrop-blur-sm"
                >
                  <Megaphone className="w-5 h-5 text-pink-400" strokeWidth={2.5} />
                  <div>
                    <div className="text-xs font-black tracking-widest text-foreground uppercase">
                      Campagne active
                    </div>
                    <div className="text-sm text-foreground/70 mt-0.5">
                      <span className="text-foreground font-bold">{candidateStats.likes}</span> likes ·{" "}
                      <span className="text-foreground font-bold">{candidateStats.comments}</span> commentaires
                    </div>
                  </div>
                </motion.div>
              )}

              {user.role === "ADMIN" && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-3 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-pink-500/10 border border-foreground/10 rounded-2xl px-5 py-4 backdrop-blur-sm"
                >
                  <Settings
                    className="w-5 h-5 text-violet-400 animate-spin-slow"
                    strokeWidth={2.5}
                    style={{ animation: "spin 8s linear infinite" }}
                  />
                  <div>
                    <div className="text-xs font-black tracking-widest text-foreground uppercase">
                      Console admin
                    </div>
                    <div className="text-sm text-foreground/70 mt-0.5">
                      <span className="text-foreground font-bold">{stats.activeElections}</span>{" "}
                      élections actives
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ═════ SECTION 2 : STATS CARDS ═════ */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-4"
          >
            <Activity className="w-4 h-4 text-foreground/40" strokeWidth={2.5} />
            <h2 className="text-xs font-black tracking-widest text-foreground/40 uppercase">
              Vos statistiques
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((stat, i) => (
              <StatCardComponent key={stat.label} stat={stat} delay={0.2 + i * 0.1} />
            ))}
          </div>
        </section>

        {/* ═════ SECTION 3 : ÉLECTION ACTIVE ═════ */}
        <AnimatePresence>
          {activeElection && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl"
            >
              {/* Background gradient + filigrane Vote */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-pink-500/10 pointer-events-none" />
              <Vote
                className="absolute -right-12 -bottom-16 w-72 h-72 text-foreground/[0.03] pointer-events-none"
                strokeWidth={1.5}
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 p-6 md:p-8">
                {/* À gauche (60%) */}
                <div className="lg:col-span-3 flex flex-col">
                  {/* Badge en cours */}
                  <div className="inline-flex items-center gap-2 self-start bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                    <span className="text-[10px] font-black tracking-widest text-rose-300 uppercase">
                      Élection en cours
                    </span>
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                    {activeElection.title}
                  </h3>

                  {/* Description */}
                  <p className="text-foreground/60 mb-6 max-w-xl">
                    {activeElection.description?.slice(0, 200)}
                  </p>

                  {/* Stats inline */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-violet-400" strokeWidth={2.5} />
                      <span>
                        <span className="text-foreground font-bold">
                          {activeElection.totalCandidates}
                        </span>{" "}
                        candidats
                      </span>
                    </div>
                    <div className="w-px h-4 bg-foreground/10" />
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                      <span>
                        <span className="text-foreground font-bold">
                          {(activeElection.totalVotes ?? 0).toLocaleString("fr-FR")}
                        </span>{" "}
                        votes comptabilisés
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    {!activeElection.hasVoted && user.role !== "ADMIN" ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/elections/${activeElection.id}/vote`)}
                        className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow"
                      >
                        <Zap className="w-4 h-4" strokeWidth={3} />
                        <span>Voter maintenant</span>
                        <ArrowRight
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          strokeWidth={3}
                        />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/elections/${activeElection.id}/results`)}
                        className="group inline-flex items-center gap-2 bg-foreground/5 border border-foreground/20 hover:border-foreground/40 text-foreground font-bold px-6 py-3 rounded-xl transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" strokeWidth={3} />
                        <span>Voir les résultats live</span>
                        <ArrowRight
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          strokeWidth={3}
                        />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* À droite (40%) : countdown */}
                <div className="lg:col-span-2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs font-black tracking-widest text-foreground/40 uppercase mb-3">
                    <Clock className="w-3.5 h-3.5" strokeWidth={3} />
                    <span>Temps restant</span>
                  </div>
                  <CountdownTimer targetDate={activeElection.voteEnd} variant="block" />

                  {/* Barre de progression participation */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-foreground/50 mb-2">
                      <span>Participation</span>
                      <span className="text-foreground font-bold">
                        {Math.round(((activeElection.totalVotes ?? 0) / 1247) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            ((activeElection.totalVotes ?? 0) / 1247) * 100
                          )}%`,
                        }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ═════ SECTION 4 : QUICK ACTIONS ═════ */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2 mb-4"
          >
            <Zap className="w-4 h-4 text-foreground/40" strokeWidth={2.5} />
            <h2 className="text-xs font-black tracking-widest text-foreground/40 uppercase">
              Actions rapides
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action, i) => (
              <QuickActionCard key={action.title} action={action} delay={0.8 + i * 0.1} />
            ))}
          </div>
        </section>

        {/* ═════ SECTION 5 : ACTIVITÉ RÉCENTE ═════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-foreground/40" strokeWidth={2.5} />
              <h2 className="text-xs font-black tracking-widest text-foreground/40 uppercase">
                Activité récente
              </h2>
            </div>
            <button className="text-xs text-foreground/50 hover:text-foreground transition-colors font-medium">
              Tout voir →
            </button>
          </div>

          {/* Timeline verticale */}
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

            <div className="space-y-4">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.08 }}
                    className="relative flex items-center gap-4 group"
                  >
                    {/* Icone avec point */}
                    <div
                      className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg ring-4 ring-[#0a0a0f]`}
                    >
                      <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4 py-1">
                      <p className="text-sm text-foreground/80 truncate group-hover:text-foreground transition-colors">
                        {item.text}
                      </p>
                      <span className="text-xs text-foreground/40 font-medium flex-shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default EasyVoteDashboard;
