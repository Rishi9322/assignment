import { api } from "./api";
import type { AdminUser, AuditLogEntry, TeamWorkload, UpdateUserPayload } from "../types/admin";

export const adminService = {
  async listUsers() {
    const { data } = await api.get<AdminUser[]>("/admin/users");
    return data;
  },

  async updateUser(id: number, payload: UpdateUserPayload) {
    const { data } = await api.patch<AdminUser>(`/admin/users/${id}`, payload);
    return data;
  },

  async auditLog(limit = 100) {
    const { data } = await api.get<AuditLogEntry[]>("/admin/audit-log", { params: { limit } });
    return data;
  },

  async teamWorkload() {
    const { data } = await api.get<TeamWorkload[]>("/admin/teams");
    return data;
  },
};
