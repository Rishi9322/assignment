import { notificationRepository } from "../repositories/notification.repository";

// Never notify a user about their own action — e.g. an agent assigning a
// ticket to themselves, or updating the status of a ticket they own.
export const notify = (
  userId: number | null | undefined,
  actorUserId: number,
  type: string,
  message: string,
  ticketId: number
) => {
  if (!userId || userId === actorUserId) return;
  notificationRepository
    .create({ userId, type, message, ticketId })
    .catch((err) => console.error("Failed to create notification:", err));
};
