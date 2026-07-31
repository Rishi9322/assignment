import { api } from "./api";
import type {
  AdminUser,
  AuditLogEntry,
  CreateTeamPayload,
  TeamDirectoryEntry,
  TeamWorkload,
  UpdateTeamPayload,
  UpdateUserPayload,
} from "../types/admin";

export const adminService = {
  async listUsers() {
    const { data } = await api.get<AdminUser[]>("/admin/users");
    return data;
  },

  async updateUser(id: number, payload: UpdateUserPayload) {
    const { data } = await api.patch<AdminUser>(`/admin/users/${id}`, payload);
    return data;
  },

  async unlockUser(id: number) {
    await api.post(`/admin/users/${id}/unlock`);
  },

  async auditLog(limit = 100) {
    const { data } = await api.get<AuditLogEntry[]>("/admin/audit-log", { params: { limit } });
    return data;
  },

  async teamWorkload() {
    const { data } = await api.get<TeamWorkload[]>("/admin/teams");
    return data;
  },

  async listTeamDirectory() {
    const { data } = await api.get<TeamDirectoryEntry[]>("/admin/team-directory");
    return data;
  },

  async createTeam(payload: CreateTeamPayload) {
    const { data } = await api.post<TeamDirectoryEntry>("/admin/team-directory", payload);
    return data;
  },

  async updateTeam(id: number, payload: UpdateTeamPayload) {
    const { data } = await api.patch<TeamDirectoryEntry>(`/admin/team-directory/${id}`, payload);
    return data;
  },
};
