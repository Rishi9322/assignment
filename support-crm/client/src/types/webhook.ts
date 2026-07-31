export interface Webhook {
  id: number;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export interface WebhookWithSecret extends Webhook {
  secret: string;
}

export interface WebhookListResponse {
  webhooks: Webhook[];
  available_events: string[];
}

export interface CreateWebhookPayload {
  url: string;
  events: string[];
}

export interface UpdateWebhookPayload {
  url?: string;
  events?: string[];
  active?: boolean;
}

export interface WebhookDelivery {
  id: number;
  event_type: string;
  status_code: number | null;
  success: boolean;
  error: string | null;
  created_at: string;
}
