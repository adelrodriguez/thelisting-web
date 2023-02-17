import type { ActionArgs } from "@remix-run/node"
import { logger } from "@sentry/utils"
import { z } from "zod"

import { clearCartQueue, createPurchaseQueue } from "~/helpers/queues"
import Sentry from "~/services/sentry"
import {
  Accepted,
  InternalServerError,
  NotAllowed,
  OK,
} from "~/utils/http.server"
import {
  getShopifyWebhookHeaders,
  parseOrderCreationWebhookPayload,
} from "~/utils/shopify"
import { checkWebhookLog, verifyWebhook } from "~/utils/webhook.server"

export function loader() {
  throw NotAllowed
}

export async function action({ request }: ActionArgs) {
  const clone = request.clone()
  const json = await clone.json()
  const headers = request.headers
  const text = await request.text()

  await verifyWebhook(headers, text)

  const { webhookId, event } = getShopifyWebhookHeaders(headers)
  logger.info(`Received ${event} webhook`, { webhookId })

  const received = await checkWebhookLog(webhookId, event, "Shopify", json)

  if (received) return Accepted

  try {
    const order = parseOrderCreationWebhookPayload(json)

    await Promise.all([
      createPurchaseQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
      clearCartQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
    ])

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
