import { prisma } from "../config/prisma";

export const attachmentRepository = {
  create: (data: {
    ticketId: number;
    storedFileName: string;
    originalFileName: string;
    mimeType: string;
    size: number;
    uploadedByUserId: number;
  }) => prisma.attachment.create({ data }),

  listByTicketId: (ticketId: number) =>
    prisma.attachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: { uploadedByUser: { select: { id: true, name: true } } },
    }),

  findById: (id: number) =>
    prisma.attachment.findUnique({
      where: { id },
      include: { ticket: { select: { ticketId: true } } },
    }),

  delete: (id: number) => prisma.attachment.delete({ where: { id } }),
};
