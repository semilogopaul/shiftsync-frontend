import { apiGet, apiPost } from "@/lib/api-client";
import type { NotificationItem } from "@/common/types/domain";

export const notificationsService = {
  list: () => apiGet<NotificationItem[]>("/notifications"),
  unreadCount: () => apiGet<{ unread: number }>("/notifications/unread-count"),
  markRead: (id: string) => apiPost<{ ok: true }>(`/notifications/${id}/read`),
  markAllRead: () => apiPost<{ ok: true }>(`/notifications/read-all`),
} as const;
