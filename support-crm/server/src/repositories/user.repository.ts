import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: number) => prisma.user.findUnique({ where: { id } }),

  create: (data: { name: string; email: string; passwordHash: string; team?: string }) =>
    prisma.user.create({ data }),

  // Only active users show up as assignment candidates.
  listAll: () =>
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true, role: true, team: true },
      orderBy: { name: "asc" },
    }),

  listAllForAdmin: () =>
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        team: true,
        active: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    }),

  update: (id: number, data: { role?: string; active?: boolean; team?: string | null }) =>
    prisma.user.update({ where: { id }, data }),
};
