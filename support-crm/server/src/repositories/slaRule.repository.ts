import { prisma } from "../config/prisma";

export const slaRuleRepository = {
  listAll: () => prisma.slaRule.findMany({ orderBy: { id: "asc" } }),

  upsertByPriority: (priority: string, hours: number) =>
    prisma.slaRule.upsert({
      where: { priority },
      update: { hours },
      create: { priority, hours },
    }),
};
