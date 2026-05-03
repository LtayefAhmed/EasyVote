// pages/admin/sections/OverviewSection.tsx
import { motion } from "framer-motion"
import { Users, Vote, TrendingUp, Award } from "lucide-react"

import { useTranslation } from "@/i18n"
import { StatCard } from "./StatCard"
import { ProgressBar } from "./ProgressBar"

const delegates = [
    { id: 1, name: "Emma Laurent", initials: "EL", votes: 1247, percentage: 32, color: "from-pink-500 to-rose-500", role: "Déléguée L3" },
    { id: 2, name: "Thomas Dubois", initials: "TD", votes: 1132, percentage: 29, color: "from-indigo-500 to-purple-500", role: "Délégué M1" },
    { id: 3, name: "Sarah Benali", initials: "SB", votes: 985, percentage: 25, color: "from-blue-500 to-cyan-500", role: "Déléguée L2" },
    { id: 4, name: "Marc Chen", initials: "MC", votes: 483, percentage: 12, color: "from-emerald-500 to-teal-500", role: "Délégué L1" },
]

const weeklyActivity = [40, 55, 45, 72, 65, 50, 76]
const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function OverviewSection() {
    const { t } = useTranslation()

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{t("admin.overview")}</h2>
                    <p className="text-sm text-gray-500">{t("admin.election_active")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ● {t("admin.active")}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label={t("admin.total_votes")}
                    value="12,847"
                    sub="↑ +234 aujourd'hui"
                    trend="up"
                    icon={<Vote className="w-5 h-5 text-white" />}
                    color="from-pink-500 to-rose-500"
                />
                <StatCard
                    label={t("admin.participation")}
                    value="78.4%"
                    sub="↑ +2.1% vs hier"
                    trend="up"
                    icon={<TrendingUp className="w-5 h-5 text-white" />}
                    color="from-purple-500 to-indigo-500"
                />
                <StatCard
                    label={t("admin.registered_students")}
                    value="16,382"
                    sub={t("admin.verified_count")}
                    icon={<Users className="w-5 h-5 text-white" />}
                    color="from-blue-500 to-cyan-500"
                />
                <StatCard
                    label={t("admin.delegates_count")}
                    value="24"
                    sub={t("admin.pending_review")}
                    icon={<Award className="w-5 h-5 text-white" />}
                    color="from-emerald-500 to-teal-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Weekly Activity */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("admin.weekly_activity")}</h3>
                    <div className="flex items-end gap-2 h-32">
                        {weeklyActivity.map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(height / 80) * 100}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                    className={`w-full rounded-t-lg ${i === 6 ? "bg-pink-500" : "bg-purple-200 dark:bg-purple-900/50"}`}
                                    style={{ height: `${(height / 80) * 100}%` }}
                                />
                                <span className={`text-[10px] ${i === 6 ? "text-pink-500 font-semibold" : "text-gray-400"}`}>
                                    {days[i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Delegates */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("admin.top_delegates")}</h3>
                    <div className="space-y-4">
                        {delegates.map((d, i) => (
                            <ProgressBar
                                key={d.id}
                                label={d.name}
                                percentage={d.percentage}
                                value={d.votes}
                                color={i === 0 ? "bg-pink-500" : i === 1 ? "bg-purple-500" : i === 2 ? "bg-indigo-500" : "bg-emerald-500"}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("admin.recent_activity")}</h3>
                <div className="space-y-3">
                    {[
                        { icon: "🗳️", text: t("admin.new_vote_recorded"), detail: t("admin.vote_detail"), time: t("admin.just_now"), badge: null },
                        { icon: "👤", text: t("admin.new_delegate_applied"), detail: t("admin.pending_delegate"), time: "", badge: { label: t("admin.pending"), color: "amber" } },
                        { icon: "✅", text: t("admin.verifications_completed"), detail: t("admin.new_verified"), time: t("admin.one_hour_ago"), badge: null },
                        { icon: "⚠️", text: t("admin.suspicious_activity"), detail: t("admin.ip_blocked"), time: "", badge: { label: t("admin.alert"), color: "red" } },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                            <span className="text-xl">{item.icon}</span>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</span>
                                <span className="text-xs text-gray-400 ml-1">— {item.detail}</span>
                            </div>
                            {item.badge ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.badge.color === "amber"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                    {item.badge.label}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}