import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { campaignService, CandidateResponse } from "@/services/campaignService"
import CandidateCard from "@/components/candidates/CandidateCard"
import { useAuthStore } from "@/store/authStore"

export default function CandidatesListPage() {
  const { electionId } = useParams<{ electionId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [candidates, setCandidates] = useState<CandidateResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!electionId) return
    campaignService.getCandidates(Number(electionId))
      .then(r => setCandidates(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [electionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
            🗳️ Candidats
          </h1>
          <p className="text-zinc-500 mt-1">
            {candidates.length} candidat{candidates.length > 1 ? "s" : ""} validé{candidates.length > 1 ? "s" : ""}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => navigate(`/elections/${electionId}/apply`)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-medium transition"
          >
            + Déposer ma candidature
          </button>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-5xl mb-4">🗳️</p>
          <p className="text-lg">Aucun candidat validé pour l'instant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(c => (
            <CandidateCard
              key={c.id}
              candidate={c}
              electionId={Number(electionId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}