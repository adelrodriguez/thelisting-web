import type { PrismaClient, WebhookService } from "@prisma/client"
import crypto from "node:crypto"

import { HOOKDECK_SIGNING_SECRET } from "~/config/env.server"

/**
 * Verify that the webhook is originating from Hookdeck.
 */
export function verifyWebhook(headers: Headers, requestText: string): boolean {
  const isHookdeckVerified = headers.get("x-hookdeck-verified") === "true"

  if (!isHookdeckVerified) return false

  const hmacHeader = headers.get("x-hookdeck-signature")
  const hmacHeader2 = headers.get("x-hookdeck-signature-2")

  // Encode the request body with the signing secret
  const hmac = crypto
    .createHmac("sha256", HOOKDECK_SIGNING_SECRET)
    .update(requestText)
    .digest("base64")

  const isPayloadVerified = hmac === hmacHeader || hmac === hmacHeader2

  return isPayloadVerified
}

/**
 * Check if we have already received this webhook call. If not, stores it in the
 * database.
 */
export async function checkWebhookLog(
  db: PrismaClient,
  webhookId: string,
  event: string,
  service: WebhookService,
  payload?: unknown,
) {
  if (typeof payload !== "object") {
    throw new Error("Payload must be an object")
  }

  if (payload === null) {
    throw new Error("Payload must not be null")
  }

  const webhook = await db.webhook.count({ where: { webhookId } })

  if (webhook) return true

  await db.webhook.create({ data: { event, payload, service, webhookId } })

  return false
}
