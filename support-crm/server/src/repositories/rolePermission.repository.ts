import { prisma } from "../config/prisma";

export const rolePermissionRepository = {
  listAll: () => prisma.rolePermission.findMany(),

  listForRole: (role: string) => prisma.rolePermission.findMany({ where: { role } }),

  hasPermission: async (role: string, permission: string) => {
    const found = await prisma.rolePermission.findUnique({
      where: { role_permission: { role, permission } },
    });
    return !!found;
  },

  // Replaces the full permission set for a role in one call, since the admin
  // UI always submits the complete checked set for a role, not a single toggle.
  setForRole: (role: string, permissions: string[]) =>
    prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { role } }),
      prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({ role, permission })),
      }),
    ]),
};
