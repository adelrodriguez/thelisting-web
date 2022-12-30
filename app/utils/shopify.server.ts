import { SHOPIFY_WEBHOOK_SECRET } from "~/config/env.server"
import { Base64, hmacSHA256 } from "~/utils/crypto.server"

export async function verifyWebhook(request: Request) {
  const cloned = request.clone()
  const body = await cloned.text()
  const headers = cloned.headers
  const hmac = headers.get("X-Shopify-Hmac-Sha256")

  const hmacPayload = encodeWebhookSignature(body, SHOPIFY_WEBHOOK_SECRET)

  return hmac === hmacPayload
}

export function encodeWebhookSignature(payload: string, secret: string) {
  return Base64.stringify(hmacSHA256(payload, secret))
}
