import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { badRequest, serverError, unauthorized } from "remix-utils"
import { z } from "zod"

import Sentry from "~/services/sentry"
import { Accepted, NotAllowed, OK } from "~/utils/http.server"
import {
  getShopifyId,
  getShopifyWebhookHeaders,
  parseCheckoutUpdateWebhookPayload,
} from "~/utils/shopify"
import { checkWebhookLog, verifyWebhook } from "~/utils/webhook.server"

// export function loader() {
//   throw NotAllowed
// }

// TODO(adelrodriguez): TEMPORARY DISABLED
export async function action({ request, context }: ActionArgs) {
  const { logger } = context

  // TODO(adelrodriguez): remove this
  logger.info({
    headers: request.headers,
    message: "Received webhook",
  })

  // const clone = request.clone()
  // const [json, text] = await Promise.all([clone.json(), request.text()])
  // const headers = request.headers

  // const isVerified = verifyWebhook(headers, text)

  // if (!isVerified) {
  //   logger.error("Webhook not verified", { headers })

  //   throw unauthorized({ message: "Webhook not verified" })
  // }

  // const { webhookId, event } = getShopifyWebhookHeaders(headers)
  // logger.info(`Received ${event} webhook`, { webhookId })

  // const received = await checkWebhookLog(db, webhookId, event, "Shopify", json)

  // if (received) {
  //   logger.info("Webhook already received. Ignoring...", { webhookId })

  //   return Accepted
  // }

  // try {
  //   const checkout = parseCheckoutUpdateWebhookPayload(json)

  //   await db.checkout.upsert({
  //     create: {
  //       commerceId: getShopifyId(checkout.id, "Checkout"),
  //       email: checkout.email,
  //       name: checkout.billing_address?.name,
  //       phone: checkout.billing_address?.phone,
  //     },
  //     update: {
  //       completedAt: checkout.completed_at,
  //       email: checkout.email,
  //       name: checkout.billing_address?.name,
  //       phone: checkout.billing_address?.phone,
  //     },
  //     where: { commerceId: getShopifyId(checkout.id, "Checkout") },
  //   })

  return json(
    { message: "Processed webhook successfully" },
    {
      status: StatusCodes.OK,
      statusText: ReasonPhrases.OK,
    }
  )
  // } catch (error) {
  //   Sentry.captureException(error)

  //   if (error instanceof z.ZodError) {
  //     return badRequest(error.message)
  //   }

  //   return serverError({ message: (error as Error).message })
  // }
}
