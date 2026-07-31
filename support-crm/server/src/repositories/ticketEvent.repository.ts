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

  // Org-wide, unfiltered activity feed — independent of any ticket list's
  // search/filter/pagination state, so it always reflects what's actually
  // happening rather than whatever slice of tickets is on screen.
  findRecent: (limit: number) =>
    prisma.ticketEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: { select: actorSelect },
        ticket: { select: { ticketId: true, subject: true, status: true } },
      },
    }),
};
