import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { campaignService, CandidateResponse } from "@/services/campaignService"
import LikeButton from "@/components/candidates/LikeButton"
import CommentSection from "@/components/candidates/CommentSection"
import QASection from "@/components/candidates/QASection"
import AnnouncementFeed from "@/components/candidates/AnnouncementFeed"
import { useAuthStore } from "@/store/authStore"
import { User, ArrowLeft } from "lucide-react"

export default function CandidateProfilePage() {
  const { electionId, candidateId } = useParams<{ electionId: string; candidateId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [candidate, setCandidate] = useState<CandidateResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!candidateId) return
    campaignService.getCandidate(Number(candidateId))
      .then(r => setCandidate(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [candidateId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p className="text-lg">Candidat introuvable</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => navigate(`/elections/${electionId}/candidates`)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux candidats
      </button>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <div className="flex gap-6 items-start">
          {candidate.photoUrl ? (
            <img
              src={candidate.photoUrl}
              className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              alt={candidate.fullName}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-indigo-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              {candidate.fullName}
            </h1>
            <p className="text-zinc-500 italic mt-1">"{candidate.slogan}"</p>
            <p className="text-xs text-zinc-400 mt-1">{candidate.electionTitle}</p>
            {isAuthenticated && (
              <div className="mt-3">
                <LikeButton
                  candidateId={candidate.id}
                  initialCount={candidate.likeCount}
                  initialLiked={candidate.likedByCurrentUser}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
            📋 Programme
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
            {candidate.program}
          </p>
        </div>
      </div>

      <AnnouncementFeed
        candidateId={candidate.id}
        candidateUserId={candidate.userId}
      />

      <QASection
        candidateId={candidate.id}
        candidateUserId={candidate.userId}
      />

      <CommentSection candidateId={candidate.id} />
    </div>
  )
}