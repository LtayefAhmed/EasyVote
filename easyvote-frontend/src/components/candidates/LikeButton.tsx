import { useState } from "react"
import { Heart } from "lucide-react"
import { campaignService } from "@/services/campaignService"

interface Props {
  candidateId: number
  initialCount: number
  initialLiked: boolean
}

export default function LikeButton({ candidateId, initialCount, initialLiked }: Props) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      const { data } = await campaignService.toggleLike(candidateId)
      setCount(data.likeCount)
      setLiked(l => !l)
    } catch (error) {
      console.error("Erreur like:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-sm font-medium
        ${liked
          ? "bg-red-50 border-red-300 text-red-600 dark:bg-red-900/20"
          : "border-zinc-300 text-zinc-600 hover:border-red-300 dark:border-zinc-600"
        } disabled:opacity-50`}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
      {count} J'aime
    </button>
  )
}