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
  try {
    const clone = request.clone()
    const json = await clone.json()
    const headers = request.headers
    const text = await request.text()

    await verifyWebhook(headers, text)

    const { webhookId, event } = getShopifyWebhookHeaders(headers)
    logger.info(`Received ${event} webhook`, { webhookId })

    const received = await checkWebhookLog(webhookId, event, "Shopify", json)

    if (received) return Accepted

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

    // TODO(adelrodriguez): Solve this issue There's an issue that's happening
    // where the ReadableStream is being locked even though we're cloning the
    // request. This is causing the request to throw a TypeError but it doesn't
    // make any of the code fail. It only returns a 500 error. Since we're
    // currently using Hookdeck, it's not a big deal since requests are not
    // being duplicated. But if we didn't, Shopify would retry the request
    // multiple times and it'd be a mess. So for now, we're just capturing the
    // error. But we should fix this.
    if (error instanceof TypeError) {
      logger.error("ReadableStream is locked?")
      Sentry.captureMessage(error.message)
    }

    return InternalServerError
  }
}
