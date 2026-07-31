import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { webhookService } from "../services/webhook.service";
import type { CreateWebhookPayload, UpdateWebhookPayload } from "../types/webhook";

export const useWebhooks = () =>
  useQuery({
    queryKey: ["admin", "webhooks"],
    queryFn: () => webhookService.list(),
  });

export const useWebhookDeliveries = (id: number | null) =>
  useQuery({
    queryKey: ["admin", "webhooks", id, "deliveries"],
    queryFn: () => webhookService.listDeliveries(id!),
    enabled: id !== null,
  });

export const useCreateWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWebhookPayload) => webhookService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] }),
  });
};

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateWebhookPayload }) =>
      webhookService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] }),
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => webhookService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] }),
  });
};

export const useTestWebhook = () => useMutation({ mutationFn: (id: number) => webhookService.test(id) });
