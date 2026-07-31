import { api } from "./api";
import type { AdminSettings, Settings, UpdateSettingsPayload } from "../types/settings";

export const settingsService = {
  async get() {
    const { data } = await api.get<Settings>("/settings");
    return data;
  },

  async getAdmin() {
    const { data } = await api.get<AdminSettings>("/settings/admin");
    return data;
  },

  async update(payload: UpdateSettingsPayload) {
    const { data } = await api.patch<AdminSettings>("/settings", payload);
    return data;
  },
};
