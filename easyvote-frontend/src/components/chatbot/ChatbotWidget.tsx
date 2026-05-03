import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  MessageCircle, X, Minus, Send, Bot, Sparkles, Calendar,
  Vote, Users, BarChart3, Lock, FileText, Zap,
} from "lucide-react"
import { chatbotService } from "@/services/chatbotService"

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
interface ChatMessage {
  id: string
  role: "USER" | "ASSISTANT"
  content: string
  timestamp: Date
  source?: "RULES" | "AI"
}

// ───────────────────────────────────────────────
// Typing indicator (3 bouncing dots)
// ───────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-2">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-pink-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// Welcome screen
// ───────────────────────────────────────────────
function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const topics = [
    { icon: Calendar, text: "Dates des élections", query: "Quelles sont les dates des prochaines élections ?" },
    { icon: Vote, text: "Comment voter", query: "Comment voter sur EasyVote ?" },
    { icon: Users, text: "Liste des candidats", query: "Qui sont les candidats ?" },
    { icon: BarChart3, text: "Résultats", query: "Comment consulter les résultats ?" },
    { icon: Lock, text: "Anonymat du vote", query: "Mon vote est-il vraiment anonyme ?" },
    { icon: FileText, text: "Devenir candidat", query: "Comment devenir candidat ?" },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center mb-5 shadow-2xl shadow-violet-500/30"
      >
        <Bot className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-black text-foreground mb-2"
      >
        Bonjour ! 👋
      </motion.h3>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-foreground/60 max-w-[280px] mb-6"
      >
        Je suis <span className="text-violet-300 font-bold">EasyBot</span>, votre assistant pour les élections universitaires. Posez-moi vos questions !
      </motion.p>

      <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
        {topics.map((topic, i) => {
          const Icon = topic.icon
          return (
            <motion.button
              key={topic.text}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              onClick={() => onSuggestionClick(topic.query)}
              className="group flex items-center gap-2 bg-foreground/5 border border-foreground/10 hover:border-foreground/20 hover:bg-foreground/10 rounded-xl px-3 py-2.5 text-left transition-all"
            >
              <Icon className="w-4 h-4 text-violet-400 shrink-0" strokeWidth={2.5} />
              <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors">{topic.text}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// Chat bubble
// ───────────────────────────────────────────────
function ChatBubble({ msg, index }: { msg: ChatMessage; index: number }) {
  const isUser = msg.role === "USER"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 10 : -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`flex items-end gap-2 px-4 py-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-md">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white rounded-2xl rounded-br-md"
            : "bg-foreground/5 border border-foreground/10 text-foreground/90 rounded-2xl rounded-bl-md"
        }`}
      >
        {msg.content}
        {!isUser && msg.source && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-foreground/40">
            {msg.source === "AI" ? (
              <><Sparkles className="w-3 h-3" /> Réponse IA</>
            ) : (
              <><Zap className="w-3 h-3" /> Base de connaissances</>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ───────────────────────────────────────────────
// Main ChatbotWidget
// ───────────────────────────────────────────────
export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()

  // Hide on auth pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register"
  if (isAuthPage) return null

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current
      // Small timeout to wait for DOM update
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 50)
    }
  }, [messages, isLoading])

  // Load history on first open
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      setHistoryLoaded(true)
      chatbotService.getHistory().then((history) => {
        if (history && history.length > 0) {
          const last10 = history.slice(-10)
          setMessages(
            last10.map((h, i) => ({
              id: `hist-${h.id || i}`,
              role: h.role === "USER" ? "USER" : "ASSISTANT",
              content: h.content,
              timestamp: new Date(h.createdAt),
            }))
          )
        }
      }).catch(() => { /* silent — no history available */ })
    }
  }, [isOpen, historyLoaded])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = useCallback(async (text?: string) => {
    const messageToSend = (text || input).trim()
    if (!messageToSend || isLoading) return

    // Add user message (optimistic)
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "USER",
      content: messageToSend,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setSuggestions([])
    setIsLoading(true)

    try {
      const response = await chatbotService.sendMessage(messageToSend, sessionId || undefined)
      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId)
      }
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "ASSISTANT",
        content: response.botResponse,
        timestamp: new Date(response.timestamp),
        source: response.source,
      }
      setMessages(prev => [...prev, botMsg])
      setSuggestions(response.suggestedQuestions || [])
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "ASSISTANT",
        content: "Désolé, je n'arrive pas à répondre pour le moment. Réessayez plus tard. 🙁",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
      toast.error("Erreur de communication avec le chatbot")
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* ═══ Floating button ═══ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 transition-shadow"
          >
            <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══ Chat panel ═══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] max-sm:w-[calc(100vw-2rem)] max-sm:h-[calc(100vh-6rem)] max-sm:bottom-4 max-sm:right-4 flex flex-col bg-background/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground">EasyBot 🤖</h4>
                  <p className="text-[11px] text-foreground/60">Votre assistant 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/50 hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/50 hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Messages area ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
              {messages.length === 0 && !isLoading ? (
                <WelcomeScreen onSuggestionClick={handleSend} />
              ) : (
                <div className="py-4 space-y-1">
                  {messages.map((msg, i) => (
                    <ChatBubble key={msg.id} msg={msg} index={i} />
                  ))}
                  {isLoading && <TypingIndicator />}
                </div>
              )}
            </div>

            {/* ── Suggestions ── */}
            {suggestions.length > 0 && !isLoading && (
              <div className="px-4 py-2 border-t border-border shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSend(s)}
                      className="shrink-0 px-3 py-1.5 bg-foreground/5 border border-foreground/10 hover:border-violet-400/40 hover:bg-foreground/10 text-foreground/70 hover:text-foreground text-xs rounded-full transition-all whitespace-nowrap"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input area ── */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1 h-10 bg-foreground/5 border border-foreground/10 focus:border-violet-400/50 rounded-full px-4 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 transition-opacity"
                >
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
