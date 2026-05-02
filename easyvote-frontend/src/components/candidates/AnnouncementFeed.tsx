import { useEffect, useState } from "react"
import { campaignService, AnnouncementResponse } from "@/services/campaignService"
import { useAuthStore } from "@/store/authStore"

interface Props {
  candidateId: number
  candidateUserId: number
}

export default function AnnouncementFeed({ candidateId, candidateUserId }: Props) {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const isOwner = user?.id === candidateUserId

  useEffect(() => {
    campaignService.getAnnouncements(candidateId).then(r => setAnnouncements(r.data))
  }, [candidateId])

  const submit = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const { data } = await campaignService.addAnnouncement(candidateId, text)
      setAnnouncements(prev => [data, ...prev])
      setText("")
    } catch (error) {
      console.error("Erreur annonce:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700">
      <h2 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-100">
        📢 Annonces ({announcements.length})
      </h2>

      {isOwner && (
        <div className="flex gap-2 mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Publier une annonce..."
            rows={2}
            className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <button
            onClick={submit}
            disabled={loading || !text.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 self-end"
          >
            {loading ? "..." : "Publier"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {announcements.length === 0 && (
          <p className="text-zinc-400 text-sm text-center py-4">
            Aucune annonce pour l'instant
          </p>
        )}
        {announcements.map(a => (
          <div key={a.id} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{a.content}</p>
            <p className="text-xs text-zinc-400 mt-2">
              {new Date(a.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}