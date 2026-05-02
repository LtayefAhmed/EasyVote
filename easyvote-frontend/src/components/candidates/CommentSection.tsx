import { useEffect, useState } from "react"
import { campaignService, CommentResponse } from "@/services/campaignService"
import { useAuthStore } from "@/store/authStore"

interface Props {
  candidateId: number
}

export default function CommentSection({ candidateId }: Props) {
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    campaignService.getComments(candidateId).then(r => setComments(r.data))
  }, [candidateId])

  const submit = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const { data } = await campaignService.addComment(candidateId, text)
      setComments(prev => [data, ...prev])
      setText("")
    } catch (error) {
      console.error("Erreur commentaire:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700">
      <h2 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-100">
        💬 Commentaires ({comments.length})
      </h2>

      {isAuthenticated && (
        <div className="flex gap-2 mb-6">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Votre commentaire..."
            onKeyDown={e => e.key === "Enter" && submit()}
            className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={submit}
            disabled={loading || !text.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "..." : "Envoyer"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-zinc-400 text-sm text-center py-4">
            Aucun commentaire pour l'instant
          </p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
              {c.authorName[0].toUpperCase()}
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-2 text-sm flex-1">
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {c.authorName}
              </span>
              <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">{c.content}</p>
              <p className="text-zinc-400 text-xs mt-1">
                {new Date(c.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}