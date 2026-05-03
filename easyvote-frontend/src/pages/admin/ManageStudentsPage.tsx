import { useState, useEffect } from "react"
import { Users, Search, Mail, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { authService } from "@/services/authService"
import { UserSummary } from "@/types"
import { toast } from "sonner"

export default function ManageStudentsPage() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    authService.getAllUsers()
      .then(res => setUsers(res.data))
      .catch(err => toast.error("Erreur de chargement des utilisateurs. " + (err.response?.data?.message || "")))
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-foreground/5 border border-foreground/10 backdrop-blur-md rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Gestion des utilisateurs
            </h1>
          </div>
          <p className="text-foreground/60 max-w-2xl">
            Visualisez tous les étudiants, candidats et administrateurs inscrits sur la plateforme.
          </p>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 bg-foreground/5 border border-foreground/10 rounded-full pl-10 pr-4 text-sm text-foreground focus:border-cyan-500/50 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-foreground/70">
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400" /> Étudiant</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-400" /> Candidat</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /> Admin</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/80">
            <thead className="text-xs uppercase bg-foreground/5 border-b border-foreground/10">
              <tr>
                <th className="px-6 py-4 font-bold">Utilisateur</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Rôle</th>
                <th className="px-6 py-4 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-foreground/50">Chargement...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-foreground/50">Aucun utilisateur trouvé</td></tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-foreground/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center font-bold text-xs text-white">
                          {user.fullName.charAt(0)}
                        </div>
                        <span className="font-semibold">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                        user.role === 'CANDIDATE' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-medium text-xs">
                          <CheckCircle className="w-4 h-4" /> Vérifié
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-foreground/40 font-medium text-xs">
                          <XCircle className="w-4 h-4" /> Non vérifié
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
