import type { ActionArgs } from "@remix-run/node"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import prisma from "~/helpers/prisma.server"
import { invoicingQueue } from "~/helpers/queues"
import { OK, Unauthorized } from "~/utils/http.server"
import { logger } from "~/utils/log"
import { orderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { getWebhookHeaders, verifyWebhook } from "~/utils/shopify.server"

export async function action({ request }: ActionArgs): Promise<Response> {
  const verification = await request.clone()
  const verified = await verifyWebhook(verification)

  if (!verified) {
    return Unauthorized
  }

  const headers = await request.clone()
  const body = await request.json()

  const { id, event } = await getWebhookHeaders(headers.headers)

  if (id && event) {
    // Check if we have already received this webhook call
    const webhook = await prisma.webhook.findFirst({
      where: { serviceId: id },
    })

    if (webhook) return OK

    // If not, save it
    await prisma.webhook.create({
      data: { event, payload: body, service: "Shopify", serviceId: id },
    })
  }

  try {
    logger.info(`Received ${event} webhook`, { id })

    const order = orderPaymentWebhookPayloadSchema.parse(body)

    await invoicingQueue.add(`${order.number}`, {
      address: order.billing_address.address1,
      city: order.billing_address.city,
      currencyCode: order.currency,
      date: order.processed_at,
      email: order.customer.email,
      name: `${order.customer.first_name} ${order.customer.last_name}`,
      orderNumber: order.number,
      phone: order.billing_address.phone,
      shippingPrice: order.shipping_lines[0]?.price ?? 0,
    })

    return OK
  } catch (error) {
    Sentry.captureException(error)

    if (error instanceof z.ZodError) {
      logger.error("Error parsing request body")
      logger.error(error.message, { error })
    }

    // Return OK so Shopify doesn't retry the webhook
    return OK
  }
}
