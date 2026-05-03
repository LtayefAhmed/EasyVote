import { useState } from "react"
import { Download, Trophy, TrendingUp, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/i18n"
import {  StatusBadge } from "./StatusBadge"
import { StatCard } from "./StatCard"
import { ProgressBar } from "./ProgressBar"

const resultsData = [
  { id: 1, name: "Emma Laurent", initials: "EL", role: "Déléguée L3", votes: 3247, percentage: 34, color: "from-pink-500 to-rose-500", status: "elected" as const },
  { id: 2, name: "Thomas Dubois", initials: "TD", role: "Délégué M1", votes: 2890, percentage: 30, color: "from-indigo-500 to-purple-500", status: "elected" as const },
  { id: 3, name: "Sarah Benali", initials: "SB", role: "Déléguée L2", votes: 2356, percentage: 25, color: "from-blue-500 to-cyan-500", status: "elected" as const },
  { id: 4, name: "Marc Chen", initials: "MC", role: "Délégué L1", votes: 1150, percentage: 12, color: "from-emerald-500 to-teal-500", status: "runner_up" as const },
]

const electionInfo = {
  totalVotes: 9643,
  totalStudents: 16382,
  participationRate: 58.9,
  startDate: "2024-04-01",
  endDate: "2024-04-15",
  status: "closed" as const,
}

export function ResultsSection() {
  const { t } = useTranslation()
  const [showLive, setShowLive] = useState(false)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{t("admin.election_results")}</h2>
          <p className="text-sm text-gray-500">{t("admin.results_subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-1" /> {t("admin.export_pdf")}
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
            {t("admin.publish_results")}
          </Button>
        </div>
      </div>

      {/* Election Status */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-200 dark:border-pink-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("admin.election_closed")}</h3>
              <p className="text-xs text-gray-500">{electionInfo.startDate} → {electionInfo.endDate}</p>
            </div>
          </div>
          <StatusBadge status="closed" label={t("admin.closed")} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label={t("admin.total_votes_cast")} value={electionInfo.totalVotes.toLocaleString()} />
        <StatCard label={t("admin.participation")} value={`${electionInfo.participationRate}%`} />
        <StatCard label={t("admin.elected_delegates")} value="3" />
        <StatCard label={t("admin.total_candidates")} value="12" />
      </div>

      {/* Results Ranking */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> {t("admin.final_ranking")}
        </h3>
        <div className="space-y-5">
          {resultsData.map((candidate, i) => (
            <div key={candidate.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${candidate.color} flex items-center justify-center text-white font-bold text-xs`}>
                    {candidate.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.role}</p>
                  </div>
                  {candidate.status === "elected" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {t("admin.elected")}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{candidate.votes.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{candidate.percentage}%</p>
                </div>
              </div>
              <ProgressBar percentage={candidate.percentage} color={i === 0 ? "bg-pink-500" : i === 1 ? "bg-purple-500" : i === 2 ? "bg-indigo-500" : "bg-emerald-500"} showLabel={false} />
            </div>
          ))}
        </div>
      </div>

      {/* Integrity Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> {t("admin.election_integrity")}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("admin.double_votes")}</span>
              <span className="text-sm font-semibold text-green-600">0 {t("admin.detected")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("admin.anonymous_votes")}</span>
              <span className="text-sm font-semibold text-green-600">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("admin.blockchain_verified")}</span>
              <span className="text-sm font-semibold text-green-600">{t("admin.verified")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("admin.audit_log")}</span>
              <span className="text-sm font-semibold text-blue-600">{t("admin.complete")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {t("admin.next_steps")}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t("admin.results_validated")}</p>
                <p className="text-xs text-gray-500">{t("admin.results_validated_desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t("admin.appeal_period")}</p>
                <p className="text-xs text-gray-500">{t("admin.appeal_period_desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t("admin.inauguration")}</p>
                <p className="text-xs text-gray-500">{t("admin.inauguration_desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}