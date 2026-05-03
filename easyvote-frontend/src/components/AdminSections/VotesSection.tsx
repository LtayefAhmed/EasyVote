// pages/admin/sections/VotesSection.tsx
import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Download, Plus, Eye, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/i18n"
import { SectionHeader } from "./SectionHeader"
import { StatCard } from "./StatCard"
import { StatusBadge } from "./StatusBadge"


const votesLog = [
  { id: "#V8821", student: "•••4821", delegate: "Emma Laurent", time: "Aujourd'hui 14:32", ip: "10.0.1.12", status: "valid" as const },
  { id: "#V8820", student: "•••3205", delegate: "Thomas Dubois", time: "Aujourd'hui 14:28", ip: "10.0.1.8", status: "valid" as const },
  { id: "#V8815", student: "•••7741", delegate: "Sarah Benali", time: "Aujourd'hui 13:55", ip: "10.0.1.3", status: "suspect" as const },
  { id: "#V8810", student: "•••9012", delegate: "Emma Laurent", time: "Aujourd'hui 13:41", ip: "192.168.1.45", status: "invalid" as const },
  { id: "#V8805", student: "•••6632", delegate: "Marc Chen", time: "Aujourd'hui 13:22", ip: "10.0.1.21", status: "valid" as const },
  { id: "#V8798", student: "•••1245", delegate: "Emma Laurent", time: "Aujourd'hui 12:15", ip: "10.0.1.7", status: "valid" as const },
  { id: "#V8789", student: "•••9876", delegate: "Thomas Dubois", time: "Aujourd'hui 11:48", ip: "10.0.1.14", status: "valid" as const },
  { id: "#V8776", student: "•••5432", delegate: "Yasmine Khalil", time: "Aujourd'hui 10:32", ip: "10.0.1.22", status: "pending" as const },
]

export function VotesSection() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filtered = votesLog.filter(v => 
    (filterStatus === "all" || v.status === filterStatus) &&
    (v.id.toLowerCase().includes(search.toLowerCase()) || 
     v.delegate.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = {
    total: votesLog.length,
    valid: votesLog.filter(v => v.status === "valid").length,
    suspect: votesLog.filter(v => v.status === "suspect").length,
    invalid: votesLog.filter(v => v.status === "invalid").length,
  }

  return (
    <div>
      <SectionHeader 
        title={t("admin.votes_management")} 
        subtitle={t("admin.votes_subtitle")}
        showExportButton
        showAddButton
        addButtonLabel={t("admin.create_election")}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label={t("admin.total_votes")} value={stats.total} />
        <StatCard label={t("admin.valid_votes")} value={stats.valid} />
        <StatCard label={t("admin.suspect_votes")} value={stats.suspect} />
        <StatCard label={t("admin.invalid_votes")} value={stats.invalid} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder={t("admin.search_votes")} 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">{t("admin.all_status")}</option>
          <option value="valid">{t("admin.valid")}</option>
          <option value="suspect">{t("admin.suspect")}</option>
          <option value="invalid">{t("admin.invalid")}</option>
          <option value="pending">{t("admin.pending")}</option>
        </select>
      </div>

      {/* Votes Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.vote_id")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.student")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.delegate")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.date_time")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">IP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.status")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vote, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{vote.id}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{vote.student}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{vote.delegate}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{vote.time}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{vote.ip}</td>
                  <td className="px-4 py-3"><StatusBadge  status={vote.status} /></td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      {vote.status === "suspect" ? t("admin.review") : t("admin.view")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}