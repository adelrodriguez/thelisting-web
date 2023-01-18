import type { WebhookService } from "@prisma/client"
import Base64 from "crypto-js/enc-base64"
import hmacSHA256 from "crypto-js/hmac-sha256"

import { HOOKDECK_SIGNING_SECRET } from "~/config/env.server"
import prisma from "~/helpers/prisma.server"

/**
 * Verify that the webhook is originating from Hookdeck.
 */
export async function verifyWebhook(request: Request): Promise<boolean> {
  const headers = await request.clone().headers

  const verified = headers.get("x-hookdeck-verified") === "true"

  if (!verified) return false

  const body = await request.clone().text()

  const hmacHeader = headers.get("x-hookdeck-signature")
  const hmacHeader2 = headers.get("x-hookdeck-signature-2")

  const hmac = encodeWebhookSignature(body, HOOKDECK_SIGNING_SECRET)

  return hmac === hmacHeader || hmac === hmacHeader2
}

export function encodeWebhookSignature(
  payload: string,
  secret: string
): string {
  return Base64.stringify(hmacSHA256(payload, secret))
}

/**
 * Check if we have already received this webhook call.
 * @returns true if we have already received this webhook call
 */
export async function checkIfWebhookIsRepeated(
  webhookId: string,
  event: string,
  service: WebhookService,
  payload?: string
): Promise<boolean> {
  // Check if we have already received this webhook call
  const webhook = await prisma.webhook.findFirst({
    where: { serviceId: webhookId },
  })

  if (webhook) return true

  // If not, save it
  await prisma.webhook.create({
    data: {
      event,
      payload,
      service,
      serviceId: webhookId,
    },
  })

  return false
}
