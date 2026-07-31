import { prisma } from "../config/prisma";

export const webhookRepository = {
  listAll: () => prisma.webhook.findMany({ orderBy: { createdAt: "desc" } }),

  listActive: () => prisma.webhook.findMany({ where: { active: true } }),

  findById: (id: number) => prisma.webhook.findUnique({ where: { id } }),

  create: (data: { url: string; secret: string; events: string }) =>
    prisma.webhook.create({ data }),

  update: (id: number, data: { url?: string; events?: string; active?: boolean }) =>
    prisma.webhook.update({ where: { id }, data }),

  delete: (id: number) => prisma.webhook.delete({ where: { id } }),

  recordDelivery: (data: {
    webhookId: number;
    eventType: string;
    payload: string;
    statusCode: number | null;
    success: boolean;
    error: string | null;
  }) => prisma.webhookDelivery.create({ data }),

  listDeliveries: (webhookId: number, limit = 20) =>
    prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
};
