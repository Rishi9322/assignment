import { prisma } from "../config/prisma";
import { TicketEventType } from "../types/ticket";

const actorSelect = { id: true, name: true, email: true } as const;

export const ticketEventRepository = {
  create: (data: {
    ticketId: number;
    actorUserId: number | null;
    type: TicketEventType;
    fromValue?: string | null;
    toValue?: string | null;
    message?: string | null;
  }) => prisma.ticketEvent.create({ data }),

  findByTicketId: (ticketId: number) =>
    prisma.ticketEvent.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: { actor: { select: actorSelect } },
    }),
};
