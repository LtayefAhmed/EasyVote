// pages/admin/sections/DelegatesSection.tsx
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Check, X, Eye, Mail, Phone, Calendar, Award, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/i18n"
import { SectionHeader } from "./SectionHeader"
import { Status, StatusBadge } from "./StatusBadge"
import { StatCard } from "./StatCard"


// Define the Delegate type
interface Delegate {
  id: number
  name: string
  initials: string
  role: string
  program: string
  votes: number
  percentage: number
  status: Status  
  color: string
  bio: string
  program_detail: string
  email: string
  phone: string
}

const delegatesData: Delegate[] = [
  { id: 1, name: "Emma Laurent", initials: "EL", role: "Déléguée L3 Informatique", program: "Informatique", votes: 1247, percentage: 32, status: "approved", color: "from-pink-500 to-rose-500", bio: "Engagée pour l'innovation pédagogique et l'égalité des chances.", program_detail: "Création d'espaces de coworking, amélioration WiFi, hackathons mensuels.", email: "emma.laurent@univ.fr", phone: "+33 6 12 34 56 78" },
  { id: 2, name: "Thomas Dubois", initials: "TD", role: "Délégué M1 Économie", program: "Économie", votes: 1132, percentage: 29, status: "approved", color: "from-indigo-500 to-purple-500", bio: "Pour une université plus inclusive et des opportunités pour tous.", program_detail: "Programme de mentorat, bourses sociales, événements carrière.", email: "thomas.dubois@univ.fr", phone: "+33 6 23 45 67 89" },
  { id: 3, name: "Sarah Benali", initials: "SB", role: "Déléguée L2 Médecine", program: "Médecine", votes: 985, percentage: 25, status: "approved", color: "from-blue-500 to-cyan-500", bio: "La santé étudiante au cœur de mon engagement.", program_detail: "Amélioration du SUMPPS, santé mentale, prévention.", email: "sarah.benali@univ.fr", phone: "+33 6 34 56 78 90" },
  { id: 4, name: "Yasmine Khalil", initials: "YK", role: "Déléguée L1 Droit", program: "Droit", votes: 0, percentage: 0, status: "pending", color: "from-amber-500 to-orange-500", bio: "Nouvelle voix pour une université plus verte.", program_detail: "Campus durable, recyclage, sensibilisation environnementale.", email: "yasmine.khalil@univ.fr", phone: "+33 6 45 67 89 01" },
]

export function DelegatesSection() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null)

  const filtered = delegatesData.filter(d => 
    (filterStatus === "all" || d.status === filterStatus) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = {
    total: delegatesData.length,
    approved: delegatesData.filter(d => d.status === "approved").length,
    pending: delegatesData.filter(d => d.status === "pending").length,
    rejected: delegatesData.filter(d => d.status === "rejected").length,
  }

  const handleApprove = (id: number) => {
    // Approve logic - in real app, this would call an API
    console.log("Approve delegate:", id)
    setSelectedDelegate(null)
  }

  const handleReject = (id: number) => {
    // Reject logic - in real app, this would call an API
    console.log("Reject delegate:", id)
    setSelectedDelegate(null)
  }

  const handleRemove = (id: number) => {
    // Remove logic - in real app, this would call an API
    console.log("Remove delegate:", id)
  }

  return (
    <div>
      <SectionHeader 
        title={t("admin.delegates_management")} 
        subtitle={t("admin.manage_delegates_subtitle")}
        showAddButton
        addButtonLabel={t("admin.add_delegate")}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label={t("admin.total")} value={stats.total} />
        <StatCard label={t("admin.approved")} value={stats.approved} />
        <StatCard label={t("admin.pending")} value={stats.pending} />
        <StatCard label={t("admin.rejected")} value={stats.rejected} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder={t("admin.search_delegates")} 
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
          <option value="approved">{t("admin.approved")}</option>
          <option value="pending">{t("admin.pending")}</option>
          <option value="rejected">{t("admin.rejected")}</option>
        </select>
      </div>

      {/* Delegates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((delegate) => (
          <motion.div
            key={delegate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Header */}
            <div className={`h-24 bg-gradient-to-r ${delegate.color} relative`}>
              <div className="absolute -bottom-8 left-4">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-900">
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {delegate.initials}
                  </span>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={delegate.status} />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 pt-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{delegate.name}</h3>
              <p className="text-sm text-pink-600 dark:text-pink-400 mb-2">{delegate.role}</p>
              <p className="text-xs text-gray-500 mb-3">{delegate.program}</p>
              
              {delegate.votes > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{t("admin.votes")}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{delegate.votes.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${delegate.color}`} style={{ width: `${delegate.percentage}%` }} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs flex-1"
                  onClick={() => setSelectedDelegate(delegate)}
                >
                  <Eye className="w-3 h-3 mr-1" /> {t("admin.view_details")}
                </Button>
                {delegate.status === "pending" ? (
                  <>
                    <Button 
                      size="sm" 
                      className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 flex-1" 
                      onClick={() => handleApprove(delegate.id)}
                    >
                      <Check className="w-3 h-3 mr-1" /> {t("admin.approve")}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs text-red-500 hover:text-red-600 flex-1" 
                      onClick={() => handleReject(delegate.id)}
                    >
                      <X className="w-3 h-3 mr-1" /> {t("admin.reject")}
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs flex-1 text-red-500 hover:text-red-600" 
                    onClick={() => handleRemove(delegate.id)}
                  >
                    <X className="w-3 h-3 mr-1" /> {t("admin.remove")}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDelegate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedDelegate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-32 bg-gradient-to-r ${selectedDelegate.color}`} />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center -mt-12 border-4 border-white dark:border-gray-900">
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {selectedDelegate.initials}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDelegate.name}</h2>
                    <p className="text-pink-600 dark:text-pink-400">{selectedDelegate.role}</p>
                    <div className="mt-1">
                      <StatusBadge status={selectedDelegate.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> {t("admin.bio")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedDelegate.bio}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" /> {t("admin.program")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{selectedDelegate.program_detail}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" /> {selectedDelegate.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" /> {selectedDelegate.phone}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0" 
                    onClick={() => setSelectedDelegate(null)}
                  >
                    {t("admin.close")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}