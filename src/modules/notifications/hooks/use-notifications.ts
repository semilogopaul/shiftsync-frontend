"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsService } from "../services/notifications-service";

const LIST_KEY = ["notifications", "list"] as const;
const COUNT_KEY = ["notifications", "unread-count"] as const;

export function useNotifications() {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: LIST_KEY,
    queryFn: notificationsService.list,
  });

  const unreadCount = useQuery({
    queryKey: COUNT_KEY,
    queryFn: notificationsService.unreadCount,
    // Realtime: invalidated by the socket bridge on `notification` events.
    refetchOnWindowFocus: true,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: invalidate,
  });

  return { list, unreadCount, markRead, markAllRead };
}
