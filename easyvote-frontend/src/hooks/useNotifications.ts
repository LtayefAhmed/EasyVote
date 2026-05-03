import { useState, useEffect, useCallback } from "react"
import { notificationService } from "@/services/notificationService"
import type { AppNotification } from "@/types"

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Fetching notifications...")
      const [notifs, count] = await Promise.all([
        notificationService.getAll().catch(() => [] as AppNotification[]),
        notificationService.getUnreadCount().catch(() => 0),
      ])
      console.log("Notifs:", notifs, "Count:", count)
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      console.error("Failed to fetch notifications", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark as read", error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read", error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  return { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead }
}
