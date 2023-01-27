import type { ActionArgs } from "@remix-run/node"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import { saveOrderCustomerQueue } from "~/helpers/queues"
import {
  getJSON,
  InternalServerError,
  NotAllowed,
  OK,
  verifyMethod,
} from "~/utils/http.server"
import { logger } from "~/utils/log"
import {
  getShopifyWebhookHeaders,
  parseOrderPaymentWebhookPayload,
} from "~/utils/shopify"
import {
  verifyIfWebhookIsProcessed,
  verifyWebhook,
} from "~/utils/webhook.server"

export function loader() {
  throw NotAllowed
}

export async function action({ request }: ActionArgs) {
  await verifyMethod(request, "POST")
  await verifyWebhook(request)

  const { webhookId, event } = getShopifyWebhookHeaders(request)

  const body = await getJSON(request)

  await verifyIfWebhookIsProcessed(webhookId, event, "Shopify", body)

  try {
    logger.info(`Received ${event} webhook`, { webhookId })

    const order = parseOrderPaymentWebhookPayload(body)

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
