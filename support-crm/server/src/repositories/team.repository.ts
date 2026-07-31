import { prisma } from "../config/prisma";

export const teamRepository = {
  listActive: () => prisma.team.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),

  listAll: () => prisma.team.findMany({ orderBy: { name: "asc" } }),

  create: (name: string) => prisma.team.create({ data: { name } }),

  update: (id: number, data: { archived?: boolean; name?: string }) =>
    prisma.team.update({ where: { id }, data }),

  findByName: (name: string) => prisma.team.findUnique({ where: { name } }),
};
