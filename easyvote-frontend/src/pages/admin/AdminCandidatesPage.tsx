import { useEffect, useState } from "react"
import { campaignService, CandidateResponse } from "@/services/campaignService"
import { Check, X, User } from "lucide-react"

export default function AdminCandidatesPage() {
  const [pending, setPending] = useState<CandidateResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [electionId] = useState(1)

  useEffect(() => {
    campaignService.getPendingCandidates(electionId)
      .then(r => setPending(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [electionId])

  const decide = async (id: number, approve: boolean) => {
    try {
      await campaignService.validateCandidate(id, approve)
      setPending(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error("Erreur validation:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">
        ⚙️ Candidatures en attente
      </h1>
      <p className="text-zinc-500 text-sm mb-6">
        {pending.length} candidature{pending.length > 1 ? "s" : ""} à traiter
      </p>

      {pending.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-lg">Aucune candidature en attente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(c => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 flex gap-4 items-start shadow-sm"
            >
              {c.photoUrl ? (
                <img
                  src={c.photoUrl}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  alt={c.fullName}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-indigo-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                  {c.fullName}
                </p>
                <p className="text-sm text-zinc-500 italic mt-0.5">
                  "{c.slogan}"
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                  {c.program}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {c.electionTitle} • {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => decide(c.id, true)}
                  className="bg-green-100 text-green-700 p-2.5 rounded-xl hover:bg-green-200 transition"
                  title="Valider"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => decide(c.id, false)}
                  className="bg-red-100 text-red-700 p-2.5 rounded-xl hover:bg-red-200 transition"
                  title="Rejeter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}