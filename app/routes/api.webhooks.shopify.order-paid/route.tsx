import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { z } from "zod"

import { ONE_SECOND } from "~/config/consts"
import {
  MarkPurchaseAsPaidQueue,
  SaveOrderCustomerQueue,
} from "~/helpers/queues"
import Sentry from "~/services/sentry"
import {
  badRequest,
  internalServerError,
  notAllowed,
  unauthorized,
} from "~/utils/remix"
import {
  getShopifyWebhookHeaders,
  parseOrderPaymentWebhookPayload,
} from "~/utils/shopify"
import { checkWebhookLog, verifyWebhook } from "~/utils/webhook.server"

export function loader() {
  throw notAllowed()
}

export async function action({ request, context }: ActionFunctionArgs) {
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
    jsonBody,
  )

  if (received) {
    logger.info("Webhook already received. Ignoring...", { webhookId })

    return json(
      { message: "Webhook already received. Ignoring..." },
      {
        status: StatusCodes.ACCEPTED,
        statusText: ReasonPhrases.ACCEPTED,
      },
    )
  }

  try {
    const order = parseOrderPaymentWebhookPayload(jsonBody)

    await Promise.all([
      SaveOrderCustomerQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
      MarkPurchaseAsPaidQueue.add(
        `Order #${order.number}`,
        {
          orderId: order.id,
        },
        {
          attempts: 5,
          backoff: {
            delay: ONE_SECOND.inMilliseconds * 5, // 5 seconds
            type: "exponential",
          },
          // Since Shopify sends the order/created and order/paid webhooks at
          // the same time (or very close to each other), we delay the
          // processing so we can have time for the purchase to be created.
          delay: ONE_SECOND.inMilliseconds * 5, // 5 seconds
        },
      ),
    ])

    return json(
      { message: "Processed webhook successfully" },
      {
        status: StatusCodes.OK,
        statusText: ReasonPhrases.OK,
      },
    )
  } catch (error) {
    Sentry.captureException(error)

    if (error instanceof z.ZodError) {
      logger.error("Error parsing request body")
      logger.error(error.message)

      return badRequest({
        message: error.message,
      })
    }

    logger.error("Error processing webhook", { error: error as Error })

    return internalServerError({ message: (error as Error).message })
  }
}
