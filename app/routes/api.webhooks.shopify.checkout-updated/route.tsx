import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { z } from "zod"

import Sentry from "~/services/sentry"
import {
  badRequest,
  internalServerError,
  notAllowed,
  unauthorized,
} from "~/utils/remix"
import {
  getShopifyId,
  getShopifyWebhookHeaders,
  parseCheckoutUpdateWebhookPayload,
} from "~/utils/shopify"
import { checkWebhookLog, verifyWebhook } from "~/utils/webhook.server"

export function loader() {
  throw notAllowed()
}

export async function action({ request, context }: ActionFunctionArgs) {
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
    const checkout = parseCheckoutUpdateWebhookPayload(jsonBody)

    await db.checkout.upsert({
      create: {
        commerceId: getShopifyId(checkout.id, "Checkout"),
        email: checkout.email,
        name: checkout.billing_address?.name,
        phone: checkout.billing_address?.phone,
      },
      update: {
        completedAt: checkout.completed_at,
        email: checkout.email,
        name: checkout.billing_address?.name,
        phone: checkout.billing_address?.phone,
      },
      where: { commerceId: getShopifyId(checkout.id, "Checkout") },
    })

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

      return badRequest({ message: error.message })
    }

    logger.error("Error processing webhook", { error: error as Error })

    return internalServerError({ message: (error as Error).message })
  }
}
