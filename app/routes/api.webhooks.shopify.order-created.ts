import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { badRequest, serverError, unauthorized } from "remix-utils"
import { z } from "zod"

import {
  addTagsToOrderQueue,
  clearCartQueue,
  createPurchaseQueue,
} from "~/helpers/queues"
import Sentry from "~/services/sentry"
import {
  getShopifyWebhookHeaders,
  parseOrderCreationWebhookPayload,
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
  const { logger, db } = context

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
    const order = parseOrderCreationWebhookPayload(jsonBody)

    await Promise.all([
      addTagsToOrderQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
      createPurchaseQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
      clearCartQueue.add(`Order #${order.number}`, {
        orderId: order.id,
      }),
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
