import { api } from "@/lib/api"
import type { AppNotification } from "@/types"

export const notificationService = {
  getAll: async (): Promise<AppNotification[]> =>
    (await api.get("/notifications")).data.data,

  getUnread: async (): Promise<AppNotification[]> =>
    (await api.get("/notifications/unread")).data.data,

  getUnreadCount: async (): Promise<number> =>
    (await api.get("/notifications/unread/count")).data.data.count,

  markAsRead: async (id: number) =>
    (await api.put(`/notifications/${id}/read`)).data,

  markAllAsRead: async () =>
    (await api.put("/notifications/read-all")).data,
}
