import type { WebhookService } from "@prisma/client"
import Base64 from "crypto-js/enc-base64"
import hmacSHA256 from "crypto-js/hmac-sha256"

import { HOOKDECK_SIGNING_SECRET } from "~/config/env.server"
import prisma from "~/helpers/prisma.server"
import { OK, Unauthorized } from "~/utils/http.server"
import { logger } from "~/utils/log"

/**
 * Verify that the webhook is originating from Hookdeck.
 */
export async function verifyWebhook(request: Request): Promise<void> {
  const headers = await request.clone().headers

  const isHookdeckVerified = headers.get("x-hookdeck-verified") === "true"

  if (!isHookdeckVerified) throw Unauthorized

  const body = await request.clone().text()

  const hmacHeader = headers.get("x-hookdeck-signature")
  const hmacHeader2 = headers.get("x-hookdeck-signature-2")

  const hmac = encodeWebhookSignature(body, HOOKDECK_SIGNING_SECRET)

  const isPayloadVerified = hmac === hmacHeader || hmac === hmacHeader2

  if (!isPayloadVerified) throw Unauthorized
}

export function encodeWebhookSignature(
  payload: string,
  secret: string
): string {
  return Base64.stringify(hmacSHA256(payload, secret))
}

/**
 * Check if we have already received this webhook call. Throws an OK if we have.
 */
export async function verifyIfWebhookIsProcessed(
  webhookId: string,
  event: string,
  service: WebhookService,
  payload?: string
) {
  const webhook = await prisma.webhook.count({ where: { webhookId } })

  if (webhook) {
    logger.info("Webhook already received. Ignoring...", { webhookId })

    throw OK
  }

  await prisma.webhook.create({ data: { event, payload, service, webhookId } })
}
