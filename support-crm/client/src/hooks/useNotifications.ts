import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import { useAuth } from "./useAuth";

export const useNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(),
    enabled: !!user,
    refetchInterval: 30_000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};
