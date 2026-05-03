import { api } from "@/lib/api"
import type { ChatMessageResponse, ChatHistoryItem } from "@/types"

export const chatbotService = {
  sendMessage: async (message: string, sessionId?: string): Promise<ChatMessageResponse> =>
    (await api.post("/chatbot/message", { message, sessionId })).data.data,

  getSession: async (sessionId: string) =>
    (await api.get(`/chatbot/sessions/${sessionId}`)).data.data,

  getHistory: async (): Promise<ChatHistoryItem[]> =>
    (await api.get("/chatbot/history")).data.data,
}
