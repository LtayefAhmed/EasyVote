// pages/admin/sections/VotersSection.tsx
import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Download, PieChart, Users, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/i18n"

import { StatCard } from "./StatCard"
import { ProgressBar } from "./ProgressBar"

const byDepartment = [
  { name: "Informatique", percentage: 85, color: "bg-purple-500", votes: 3245, total: 3818 },
  { name: "Médecine", percentage: 79, color: "bg-pink-500", votes: 2876, total: 3640 },
  { name: "Droit", percentage: 72, color: "bg-indigo-500", votes: 1950, total: 2708 },
  { name: "Sciences", percentage: 65, color: "bg-emerald-500", votes: 1842, total: 2834 },
  { name: "Lettres", percentage: 58, color: "bg-amber-500", votes: 1120, total: 1931 },
]

const byLevel = [
  { name: "L1", percentage: 60, votes: 2450, total: 4083 },
  { name: "L2", percentage: 75, votes: 2890, total: 3853 },
  { name: "L3", percentage: 83, votes: 3150, total: 3795 },
  { name: "M1", percentage: 90, votes: 2180, total: 2422 },
  { name: "M2", percentage: 88, votes: 1832, total: 2082 },
  { name: "Doctorat", percentage: 72, votes: 345, total: 479 },
]

const recentVoters = [
  { id: "#V8821", student: "Alice Lambert", time: "Il y a 2 min", delegate: "Emma Laurent" },
  { id: "#V8820", student: "Karim Bouzid", time: "Il y a 5 min", delegate: "Thomas Dubois" },
  { id: "#V8819", student: "Sofia Costa", time: "Il y a 12 min", delegate: "Sarah Benali" },
  { id: "#V8818", student: "Rayan Mansouri", time: "Il y a 18 min", delegate: "Emma Laurent" },
]

export function VotersSection() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")

  const totalVoters = byDepartment.reduce((sum, d) => sum + d.votes, 0)
  const totalStudents = byDepartment.reduce((sum, d) => sum + d.total, 0)
  const participationRate = Math.round((totalVoters / totalStudents) * 100)

  const filteredVoters = recentVoters.filter(v => 
    v.student.toLowerCase().includes(search.toLowerCase()) ||
    v.delegate.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{t("admin.voters")}</h2>
          <p className="text-sm text-gray-500">{t("admin.voters_subtitle")}</p>
        </div>
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" /> {t("admin.export_report")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label={t("admin.total_voters")} value={totalVoters.toLocaleString()} sub={`${t("admin.out_of")} ${totalStudents.toLocaleString()}`} />
        <StatCard label={t("admin.participation_rate")} value={`${participationRate}%`} sub={t("admin.vs_previous")} />
        <StatCard label={t("admin.anonymous_votes")} value="100%" sub={t("admin.gdpr_compliant")} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By Department */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> {t("admin.by_department")}
          </h3>
          <div className="space-y-4">
            {byDepartment.map((dept, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{dept.name}</span>
                  <span className="text-gray-500">{dept.votes.toLocaleString()} / {dept.total.toLocaleString()} ({dept.percentage}%)</span>
                </div>
                <ProgressBar percentage={dept.percentage} color={dept.color} showLabel={false} />
              </div>
            ))}
          </div>
        </div>

        {/* By Level */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> {t("admin.by_level")}
          </h3>
          <div className="space-y-4">
            {byLevel.map((level, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{level.name}</span>
                  <span className="text-gray-500">{level.votes.toLocaleString()} / {level.total.toLocaleString()} ({level.percentage}%)</span>
                </div>
                <ProgressBar 
                  percentage={level.percentage} 
                  color={level.percentage >= 80 ? "bg-green-500" : level.percentage >= 70 ? "bg-purple-500" : "bg-amber-500"} 
                  showLabel={false} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Voters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> {t("admin.recent_voters")}
        </h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder={t("admin.search_voters")} 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          {filteredVoters.map((voter, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{voter.student}</p>
                <p className="text-xs text-gray-500">{t("admin.voted_for")} {voter.delegate}</p>
              </div>
              <span className="text-xs text-gray-400">{voter.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}