import { prisma } from "../config/prisma";

export const passkeyRepository = {
  findByUserId: (userId: number) => prisma.passkey.findMany({ where: { userId } }),

  findByCredentialId: (credentialId: string) =>
    prisma.passkey.findUnique({ where: { credentialId } }),

  create: (data: {
    userId: number;
    credentialId: string;
    publicKey: string;
    counter: number;
    deviceType?: string;
    backedUp: boolean;
    transports?: string;
    nickname?: string;
  }) => prisma.passkey.create({ data }),

  updateCounter: (id: number, counter: number) =>
    prisma.passkey.update({ where: { id }, data: { counter } }),

  deleteForUser: (userId: number, id: number) =>
    prisma.passkey.deleteMany({ where: { id, userId } }),
};
