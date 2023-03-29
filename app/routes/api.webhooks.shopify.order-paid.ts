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
import {
  getShopifyWebhookHeaders,
  parseOrderPaymentWebhookPayload,
} from "~/utils/shopify"
import { checkWebhookLog, verifyWebhook } from "~/utils/webhook.server"

export function loader() {
  throw NotAllowed
}

export async function action({ request, context }: ActionArgs) {
  const logger = context.logger

  try {
    const clone = request.clone()
    const json = await clone.json()
    const text = await request.text()
    const headers = request.headers

    await verifyWebhook(headers, text)

    const { webhookId, event } = getShopifyWebhookHeaders(headers)
    logger.info(`Received ${event} webhook`, { webhookId })

    const received = await checkWebhookLog(webhookId, event, "Shopify", json)

    if (received) return Accepted

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
