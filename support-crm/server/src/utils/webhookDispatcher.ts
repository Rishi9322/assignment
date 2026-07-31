import crypto from "crypto";
import { webhookRepository } from "../repositories/webhook.repository";

const DELIVERY_TIMEOUT_MS = 5000;

const sign = (secret: string, body: string) =>
  crypto.createHmac("sha256", secret).update(body).digest("hex");

const deliverOne = async (webhook: { id: number; url: string; secret: string }, eventType: string, payload: unknown) => {
  const body = JSON.stringify({ event: eventType, data: payload, sent_at: new Date().toISOString() });
  const signature = sign(webhook.secret, body);

  let statusCode: number | null = null;
  let success = false;
  let error: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "X-Webhook-Event": eventType,
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    statusCode = res.status;
    success = res.ok;
    if (!res.ok) error = `Responded with status ${res.status}`;
  } catch (err) {
    error = err instanceof Error ? err.message : "Delivery failed";
  }

  await webhookRepository.recordDelivery({
    webhookId: webhook.id,
    eventType,
    payload: body,
    statusCode,
    success,
    error,
  });
};

// Fire-and-forget: webhook delivery must never slow down or fail the ticket
// mutation that triggered it, so this is intentionally not awaited by callers.
export const dispatchWebhookEvent = (eventType: string, payload: unknown) => {
  webhookRepository
    .listActive()
    .then((webhooks) => {
      const subscribed = webhooks.filter((w) => {
        const events: string[] = JSON.parse(w.events);
        return events.includes("*") || events.includes(eventType);
      });
      return Promise.all(subscribed.map((w) => deliverOne(w, eventType, payload)));
    })
    .catch((err) => console.error("Webhook dispatch failed:", err));
};

// Sends a test ping directly to one webhook, bypassing its event subscriptions
// — clicking "Test" should always produce a delivery, even for a webhook not
// currently subscribed to any event.
export const dispatchTestPing = (webhook: { id: number; url: string; secret: string }) => {
  deliverOne(webhook, "webhook.test", { message: "This is a test delivery from Support CRM" }).catch(
    (err) => console.error("Webhook test delivery failed:", err)
  );
};
