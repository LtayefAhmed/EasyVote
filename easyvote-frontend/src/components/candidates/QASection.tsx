import { useEffect, useState } from "react"
import { campaignService, QuestionResponse } from "@/services/campaignService"
import { useAuthStore } from "@/store/authStore"

interface Props {
  candidateId: number
  candidateUserId: number
}

export default function QASection({ candidateId, candidateUserId }: Props) {
  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const isCandidate = user?.id === candidateUserId

  useEffect(() => {
    campaignService.getQuestions(candidateId).then(r => setQuestions(r.data))
  }, [candidateId])

  const ask = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const { data } = await campaignService.askQuestion(candidateId, text)
      setQuestions(prev => [data, ...prev])
      setText("")
    } catch (error) {
      console.error("Erreur question:", error)
    } finally {
      setLoading(false)
    }
  }

  const answer = async (questionId: number, answerText: string) => {
    try {
      const { data } = await campaignService.answerQuestion(questionId, answerText)
      setQuestions(prev => prev.map(q => q.id === questionId ? data : q))
    } catch (error) {
      console.error("Erreur réponse:", error)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700">
      <h2 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-100">
        ❓ Questions & Réponses ({questions.length})
      </h2>

      {isAuthenticated && !isCandidate && (
        <div className="flex gap-2 mb-6">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Posez une question au candidat..."
            onKeyDown={e => e.key === "Enter" && ask()}
            className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={ask}
            disabled={loading || !text.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "..." : "Demander"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {questions.length === 0 && (
          <p className="text-zinc-400 text-sm text-center py-4">
            Aucune question pour l'instant
          </p>
        )}
        {questions.map(q => (
          <div key={q.id} className="border-l-4 border-indigo-400 pl-4 space-y-2">
            <div>
              <span className="text-xs text-zinc-400">{q.askerName}</span>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                ❓ {q.content}
              </p>
            </div>
            {q.answer ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                💬 {q.answer}
              </p>
            ) : isCandidate ? (
              <AnswerInput questionId={q.id} onAnswer={answer} />
            ) : (
              <p className="text-xs text-zinc-400 italic">Pas encore de réponse</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AnswerInput({ questionId, onAnswer }: {
  questionId: number
  onAnswer: (id: number, answer: string) => void
}) {
  const [text, setText] = useState("")

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Votre réponse..."
        className="flex-1 border rounded px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
      />
      <button
        onClick={() => { if (text.trim()) { onAnswer(questionId, text); setText("") } }}
        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
      >
        Répondre
      </button>
    </div>
  )
}