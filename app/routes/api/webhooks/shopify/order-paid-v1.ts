import type { ActionArgs } from "@remix-run/node"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import { invoicingQueue } from "~/helpers/queues"
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

    await invoicingQueue.add(`${order.number}`, {
      address: order.billing_address.address1,
      city: order.billing_address.city,
      currencyCode: order.currency,
      date: order.processed_at,
      email: order.customer.email,
      name: `${order.customer.first_name} ${order.customer.last_name}`,
      orderNumber: order.number,
      phone: order.billing_address.phone,
      shippingPrice: order.shipping_lines[0]?.price ?? 0,
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
