import type { ActionArgs } from "@remix-run/node"
import { z } from "zod"

import { invoicingQueue } from "~/helpers/queues"
import { InternalServerError, OK, Unauthorized } from "~/utils/http.server"
import { logger } from "~/utils/log"
import { orderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { verifyWebhook } from "~/utils/shopify.server"

export async function action({ request }: ActionArgs): Promise<Response> {
  const clone = await request.clone()
  const verified = await verifyWebhook(clone)

  if (!verified) {
    return Unauthorized
  }

  const body = await request.json()

  try {
    logger.info("Received order paid webhook", { body })

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
    if (error instanceof z.ZodError) {
      logger.error("Error parsing request body")
      logger.error(error.message, { error })

      // Return OK so Shopify doesn't retry the webhook
      return OK
    }

    return InternalServerError
  }
}
