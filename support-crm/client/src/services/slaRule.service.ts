import { api } from "./api";
import type { SlaRule } from "../types/slaRule";

export const slaRuleService = {
  async list() {
    const { data } = await api.get<SlaRule[]>("/admin/sla-rules");
    return data;
  },

  async update(priority: string, hours: number) {
    const { data } = await api.patch<SlaRule>(`/admin/sla-rules/${priority}`, { hours });
    return data;
  },
};
