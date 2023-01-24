import type { ActionArgs } from "@remix-run/node"
import { logger } from "@sentry/utils"
import { z } from "zod"

import { createPurchaseQueue } from "~/helpers/queues"
import Sentry from "~/services/sentry"
import {
  getJSON,
  InternalServerError,
  NotAllowed,
  OK,
  verifyMethod,
} from "~/utils/http.server"
import {
  getShopifyWebhookHeaders,
  orderCreationWebhookPayloadSchema,
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

    const order = orderCreationWebhookPayloadSchema.parse(body)

    await createPurchaseQueue.add(`Order #${order.number}`, {
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
