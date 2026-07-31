import { prisma } from "../config/prisma";

const SINGLETON_ID = 1;

export const settingsRepository = {
  get: () =>
    prisma.settings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    }),

  update: (data: {
    orgName?: string;
    supportEmail?: string | null;
    accentColor?: string;
    statusLabels?: string;
    priorityLabels?: string;
    sessionTimeoutMinutes?: number;
    maxLoginAttempts?: number;
    lockoutMinutes?: number;
  }) =>
    prisma.settings.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    }),
};
