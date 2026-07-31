import { api } from "./api";
import type {
  CreateWebhookPayload,
  UpdateWebhookPayload,
  WebhookDelivery,
  WebhookListResponse,
  WebhookWithSecret,
} from "../types/webhook";

export const webhookService = {
  async list() {
    const { data } = await api.get<WebhookListResponse>("/admin/webhooks");
    return data;
  },

  async create(payload: CreateWebhookPayload) {
    const { data } = await api.post<WebhookWithSecret>("/admin/webhooks", payload);
    return data;
  },

  async update(id: number, payload: UpdateWebhookPayload) {
    const { data } = await api.patch(`/admin/webhooks/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/admin/webhooks/${id}`);
  },

  async listDeliveries(id: number) {
    const { data } = await api.get<WebhookDelivery[]>(`/admin/webhooks/${id}/deliveries`);
    return data;
  },

  async test(id: number) {
    const { data } = await api.post(`/admin/webhooks/${id}/test`);
    return data;
  },
};
