import { useNavigate } from "react-router-dom"
import { Heart, User } from "lucide-react"
import { CandidateResponse } from "@/services/campaignService"

interface Props {
  candidate: CandidateResponse
  electionId: number
}

export default function CandidateCard({ candidate, electionId }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center relative">
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt={candidate.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-indigo-400 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">
          {candidate.fullName}
        </h3>
        <p className="text-zinc-500 text-sm italic mt-1 line-clamp-2">
          "{candidate.slogan}"
        </p>

        <div className="flex items-center justify-between mt-4">
          <span className="flex items-center gap-1 text-sm text-zinc-500">
            <Heart className="w-4 h-4 text-red-400" />
            {candidate.likeCount}
          </span>
          <button
            onClick={() => navigate(`/elections/${electionId}/candidates/${candidate.id}`)}
            className="text-indigo-600 text-sm font-medium hover:underline"
          >
            Voir le profil →
          </button>
        </div>
      </div>
    </div>
  )
}