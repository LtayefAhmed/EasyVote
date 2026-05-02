import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { campaignService } from "@/services/campaignService"

export default function ApplyPage() {
  const { electionId } = useParams<{ electionId: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState({ slogan: "", program: "" })
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    if (!form.slogan.trim() || !form.program.trim()) {
      setError("Veuillez remplir tous les champs")
      return
    }
    setLoading(true)
    setError("")
    try {
      const { data } = await campaignService.applyCandidate({
        slogan: form.slogan,
        program: form.program,
        electionId: Number(electionId),
      })
      if (photo) {
        await campaignService.uploadPhoto(data.id, photo)
      }
      navigate(`/elections/${electionId}/candidates/${data.id}`)
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Erreur lors de la candidature")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">
        🗳️ Déposer ma candidature
      </h1>
      <p className="text-zinc-500 text-sm mb-6">
        Remplissez le formulaire pour soumettre votre candidature à l'élection.
      </p>

      <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-1 text-zinc-700 dark:text-zinc-300">
            Slogan *
          </label>
          <input
            value={form.slogan}
            onChange={e => setForm(f => ({ ...f, slogan: e.target.value }))}
            placeholder="Votre slogan de campagne"
            maxLength={200}
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <p className="text-xs text-zinc-400 mt-1">{form.slogan.length}/200</p>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1 text-zinc-700 dark:text-zinc-300">
            Programme *
          </label>
          <textarea
            value={form.program}
            onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
            placeholder="Décrivez votre programme en détail..."
            rows={6}
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1 text-zinc-700 dark:text-zinc-300">
            Photo (optionnel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPhoto(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-zinc-600 dark:text-zinc-400
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600
              hover:file:bg-indigo-100"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border border-zinc-300 text-zinc-600 py-2.5 rounded-xl font-medium hover:bg-zinc-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Envoi en cours..." : "Soumettre"}
          </button>
        </div>
      </div>
    </div>
  )
}