import { prisma } from "../config/prisma";
import { CreateVendorInput } from "../types/vendor";

export const vendorRepository = {
  listAll: () => prisma.vendor.findMany({ orderBy: { name: "asc" } }),

  listAllWithTicketHistory: () =>
    prisma.vendor.findMany({
      orderBy: { name: "asc" },
      include: {
        tickets: {
          select: { status: true, createdAt: true, resolvedAt: true, reopenCount: true },
        },
      },
    }),

  create: (data: CreateVendorInput) =>
    prisma.vendor.create({
      data: {
        name: data.name,
        type: data.type,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        notes: data.notes,
      },
    }),

  findById: (id: number) => prisma.vendor.findUnique({ where: { id } }),
};
