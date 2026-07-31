import { api } from "./api";
import type { MyPermissions, PermissionMatrix } from "../types/permission";

export const permissionService = {
  async matrix() {
    const { data } = await api.get<PermissionMatrix>("/permissions");
    return data;
  },

  async mine() {
    const { data } = await api.get<MyPermissions>("/permissions/mine");
    return data;
  },

  async updateRole(role: string, permissions: string[]) {
    const { data } = await api.put(`/permissions/${role}`, { permissions });
    return data;
  },
};
