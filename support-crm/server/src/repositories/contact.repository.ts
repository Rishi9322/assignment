import { prisma } from "../config/prisma";

export const contactRepository = {
  findOrCreateByEmail: (email: string, name: string) =>
    prisma.contact.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    }),

  listAllWithTicketCounts: () =>
    prisma.contact.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { tickets: true } } },
    }),

  findById: (id: number) =>
    prisma.contact.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { createdAt: "desc" },
          select: {
            ticketId: true,
            subject: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
      },
    }),

  update: (id: number, data: { phone?: string | null; company?: string | null; notes?: string | null }) =>
    prisma.contact.update({ where: { id }, data }),
};
