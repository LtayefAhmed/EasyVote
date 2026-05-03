// pages/admin/sections/StudentsSection.tsx
import { useState } from "react"
import { Search, Download, Plus, CheckCircle, XCircle, Mail, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/i18n"
import { SectionHeader } from "./SectionHeader"
import {  StatusBadge } from "./StatusBadge"
import { StatCard } from "./StatCard"

const studentsData = [
  { id: "AL", name: "Alice Lambert", email: "a.lambert@univ.fr", program: "Informatique", level: "L3", verified: true, voted: true },
  { id: "KB", name: "Karim Bouzid", email: "k.bouzid@univ.fr", program: "Droit", level: "M1", verified: true, voted: false },
  { id: "SC", name: "Sofia Costa", email: "s.costa@univ.fr", program: "Médecine", level: "D1", verified: false, voted: false },
  { id: "RM", name: "Rayan Mansouri", email: "r.mansouri@univ.fr", program: "Sciences", level: "L2", verified: false, voted: false },
  { id: "LD", name: "Léa Dubois", email: "l.dubois@univ.fr", program: "Lettres", level: "L3", verified: true, voted: true },
  { id: "NC", name: "Nadia Cherif", email: "n.cherif@univ.fr", program: "Informatique", level: "M2", verified: true, voted: false },
]

export function StudentsSection() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [filterProgram, setFilterProgram] = useState("all")
  const [filterVerified, setFilterVerified] = useState("all")

  const filtered = studentsData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase())
    const matchesProgram = filterProgram === "all" || s.program === filterProgram
    const matchesVerified = filterVerified === "all" || 
                           (filterVerified === "verified" && s.verified) ||
                           (filterVerified === "unverified" && !s.verified)
    return matchesSearch && matchesProgram && matchesVerified
  })

  const stats = {
    total: studentsData.length,
    verified: studentsData.filter(s => s.verified).length,
    pending: studentsData.filter(s => !s.verified).length,
    voted: studentsData.filter(s => s.voted).length,
  }

  const programs = [...new Set(studentsData.map(s => s.program))]

  return (
    <div>
      <SectionHeader 
        title={t("admin.students_management")} 
        subtitle={t("admin.students_subtitle")}
        showExportButton
        showAddButton
        addButtonLabel={t("admin.add_student")}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label={t("admin.total_students")} value={stats.total} />
        <StatCard label={t("admin.verified")} value={stats.verified} />
        <StatCard label={t("admin.pending_verification")} value={stats.pending} />
        <StatCard label={t("admin.have_voted")} value={stats.voted} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder={t("admin.search_students")} 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
        >
          <option value="all">{t("admin.all_programs")}</option>
          {programs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select 
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
        >
          <option value="all">{t("admin.all_status")}</option>
          <option value="verified">{t("admin.verified")}</option>
          <option value="unverified">{t("admin.unverified")}</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.student")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.email")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.program")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.level")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.verification")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.vote_status")}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                        {student.id}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{student.email}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{student.program}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{student.level}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={student.verified ? "approved" : "pending"} />
                  </td>
                  <td className="px-4 py-3">
                    {student.voted ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" /> {t("admin.voted")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <XCircle className="w-3 h-3" /> {t("admin.not_voted")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {!student.verified ? (
                        <Button size="sm" className="text-xs h-7 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
                          <UserCheck className="w-3 h-3 mr-1" /> {t("admin.verify")}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          <Mail className="w-3 h-3 mr-1" /> {t("admin.contact")}
                        </Button>
                      )}
                    </div>
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