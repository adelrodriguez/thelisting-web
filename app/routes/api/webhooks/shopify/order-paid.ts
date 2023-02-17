import type { ActionArgs } from "@remix-run/node"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import { ONE_MINUTE } from "~/config/consts"
import { notifyPurchaseQueue, saveOrderCustomerQueue } from "~/helpers/queues"
import {
  Accepted,
  getJSON,
  InternalServerError,
  NotAllowed,
  OK,
} from "~/utils/http.server"
import { logger } from "~/utils/log"
import {
  getShopifyWebhookHeaders,
  parseOrderPaymentWebhookPayload,
} from "~/utils/shopify"
import {
  hasWebhookBeenAlreadyReceived,
  verifyWebhook,
} from "~/utils/webhook.server"

export function loader() {
  throw NotAllowed
}

export async function action({ request }: ActionArgs) {
  await verifyWebhook(request)

  const { webhookId, event } = getShopifyWebhookHeaders(request)
  logger.info(`Received ${event} webhook`, { webhookId })

  const body = await getJSON(request)

  const received = await hasWebhookBeenAlreadyReceived(
    webhookId,
    event,
    "Shopify",
    body
  )

  if (received) return Accepted

  try {
    const order = parseOrderPaymentWebhookPayload(body)

    await Promise.all([
      saveOrderCustomerQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
      notifyPurchaseQueue.add(
        `Order #${order.number}`,
        {
          orderId: order.id,
        },
        { attempts: 5, backoff: { delay: ONE_MINUTE, type: "exponential" } }
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
