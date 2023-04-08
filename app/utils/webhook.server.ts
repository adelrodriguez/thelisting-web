import type { PrismaClient, WebhookService } from "@prisma/client"
import Base64 from "crypto-js/enc-base64"
import hmacSHA256 from "crypto-js/hmac-sha256"
import invariant from "tiny-invariant"

import { HOOKDECK_SIGNING_SECRET } from "~/config/env.server"

/**
 * Verify that the webhook is originating from Hookdeck.
 */
export function verifyWebhook(headers: Headers, requestText: string): boolean {
  const isHookdeckVerified = headers.get("x-hookdeck-verified") === "true"

  if (!isHookdeckVerified) return false

  const hmacHeader = headers.get("x-hookdeck-signature")
  const hmacHeader2 = headers.get("x-hookdeck-signature-2")

  // Encode the request body with the signing secret.
  const hmac = Base64.stringify(
    hmacSHA256(requestText, HOOKDECK_SIGNING_SECRET)
  )

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
  payload?: unknown
) {
  invariant(typeof payload === "object", "Payload must be an object")
  invariant(payload !== null, "Payload must not be null")

  const webhook = await db.webhook.count({ where: { webhookId } })

  if (webhook) return true

  await db.webhook.create({ data: { event, payload, service, webhookId } })

  return false
}
