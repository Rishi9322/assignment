import { prisma } from "../config/prisma";

export const notificationRepository = {
  create: (data: { userId: number; type: string; message: string; ticketId?: number | null }) =>
    prisma.notification.create({ data }),

  listForUser: (userId: number, limit = 30) =>
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { ticket: { select: { ticketId: true } } },
    }),

  countUnread: (userId: number) => prisma.notification.count({ where: { userId, read: false } }),

  markRead: (id: number, userId: number) =>
    prisma.notification.updateMany({ where: { id, userId }, data: { read: true } }),

  markAllRead: (userId: number) =>
    prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } }),
};
