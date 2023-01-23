import type { ActionArgs } from "@remix-run/node"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import { saveOrderCustomerQueue } from "~/helpers/queues"
import { InternalServerError, OK, Unauthorized } from "~/utils/http.server"
import { logger } from "~/utils/log"
import { orderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { checkIfWebhookIsRepeated, verifyWebhook } from "~/utils/webhook.server"

export async function action({ request }: ActionArgs): Promise<Response> {
  const verificationClone = request.clone()
  const verified = await verifyWebhook(verificationClone)

  if (!verified) {
    return Unauthorized
  }

  const headers = await request.clone().headers
  const body = await request.json()

  const webhookId = headers.get("X-Shopify-Webhook-Id")
  const event = headers.get("X-Shopify-Topic")

  if (!webhookId || !event) {
    return InternalServerError
  }

  const isRepeated = await checkIfWebhookIsRepeated(
    webhookId,
    event,
    "Shopify",
    body
  )

  // If we have already received this webhook call, return OK
  if (isRepeated) {
    logger.info("Webhook already received. Ignoring...", { webhookId })

    return OK
  }

  try {
    logger.info(`Received ${event} webhook`, { webhookId })

    const order = orderPaymentWebhookPayloadSchema.parse(body)

    await saveOrderCustomerQueue.add(`Order #${order.number}`, {
      orderId: order.id,
    })

    return OK
  } catch (error) {
    Sentry.captureException(error)

    if (error instanceof z.ZodError) {
      logger.error("Error parsing request body")
      logger.error(error.message, { error })
    }

    return InternalServerError
  }
}
