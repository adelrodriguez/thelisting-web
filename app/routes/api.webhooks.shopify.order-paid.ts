import type { ActionArgs } from "@remix-run/node"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import { ONE_MINUTE } from "~/config/consts"
import { notifyPurchaseQueue, saveOrderCustomerQueue } from "~/helpers/queues"
import {
  Accepted,
  InternalServerError,
  NotAllowed,
  OK,
} from "~/utils/http.server"
import { logger } from "~/utils/log"
import {
  getShopifyWebhookHeaders,
  parseOrderPaymentWebhookPayload,
} from "~/utils/shopify"
import { checkWebhookLog, verifyWebhook } from "~/utils/webhook.server"

export function loader() {
  throw NotAllowed
}

export async function action({ request }: ActionArgs) {
  const clone = request.clone()
  const json = await clone.json()
  const text = await request.text()
  const headers = request.headers

  await verifyWebhook(headers, text)

  const { webhookId, event } = getShopifyWebhookHeaders(headers)
  logger.info(`Received ${event} webhook`, { webhookId })

  const received = await checkWebhookLog(webhookId, event, "Shopify", json)

  if (received) return Accepted

  try {
    const order = parseOrderPaymentWebhookPayload(json)

    await Promise.all([
      saveOrderCustomerQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
      // TODO(adelrodriguez): Create a new queue to mark the purchase as paid,
      // and then notify the customer from there.
      notifyPurchaseQueue.add(
        `Order #${order.number}`,
        {
          orderId: order.id,
        },
        { attempts: 10, backoff: { delay: ONE_MINUTE, type: "exponential" } }
      ),
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
