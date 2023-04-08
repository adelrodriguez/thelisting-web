import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import * as Sentry from "@sentry/remix"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { badRequest, serverError, unauthorized } from "remix-utils"
import { z } from "zod"

import { ONE_MINUTE } from "~/config/consts"
import { notifyPurchaseQueue, saveOrderCustomerQueue } from "~/helpers/queues"
import {
  getShopifyWebhookHeaders,
  parseOrderPaymentWebhookPayload,
} from "~/utils/shopify"
import { checkWebhookLog, verifyWebhook } from "~/utils/webhook.server"

export function loader() {
  throw json(
    { message: "This method is not allowed" },
    {
      status: StatusCodes.METHOD_NOT_ALLOWED,
      statusText: ReasonPhrases.METHOD_NOT_ALLOWED,
    }
  )
}

export async function action({ request, context }: ActionArgs) {
  const { db, logger } = context

  const clone = request.clone()
  const [jsonBody, textBody] = await Promise.all([clone.json(), request.text()])
  const headers = request.headers

  const isVerified = verifyWebhook(headers, textBody)

  if (!isVerified) {
    logger.error("Webhook not verified", { headers })

    throw unauthorized({ message: "Webhook not verified" })
  }

  const { webhookId, event } = getShopifyWebhookHeaders(headers)
  logger.info(`Received ${event} webhook`, { webhookId })

  const received = await checkWebhookLog(
    db,
    webhookId,
    event,
    "Shopify",
    jsonBody
  )

  if (received) {
    logger.info("Webhook already received. Ignoring...", { webhookId })

    return json(
      { message: "Webhook already received. Ignoring..." },
      {
        status: StatusCodes.ACCEPTED,
        statusText: ReasonPhrases.ACCEPTED,
      }
    )
  }

  try {
    const order = parseOrderPaymentWebhookPayload(jsonBody)

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

    return json(
      { message: "Processed webhook successfully" },
      {
        status: StatusCodes.OK,
        statusText: ReasonPhrases.OK,
      }
    )
  } catch (error) {
    Sentry.captureException(error)

    if (error instanceof z.ZodError) {
      logger.error("Error parsing request body")
      logger.error(error.message)

      return badRequest(error.message, {
        statusText: ReasonPhrases.BAD_REQUEST,
      })
    }

    return serverError(
      { message: (error as Error).message },
      { statusText: ReasonPhrases.INTERNAL_SERVER_ERROR }
    )
  }
}
