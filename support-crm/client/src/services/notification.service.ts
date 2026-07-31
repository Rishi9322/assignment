import { api } from "./api";
import type { NotificationList } from "../types/notification";

export const notificationService = {
  async list() {
    const { data } = await api.get<NotificationList>("/notifications");
    return data;
  },

  async markRead(id: number) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await api.post("/notifications/mark-all-read");
  },
};
