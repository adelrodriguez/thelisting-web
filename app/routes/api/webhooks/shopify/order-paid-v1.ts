import type { ActionArgs } from "@remix-run/node"
import currency from "currency.js"
import { z } from "zod"

import {
  ALEGRA_INVOICE_BACKUP_EMAIL,
  ALEGRA_SERVICE_ITEM_ID,
} from "~/config/env.server"
import alegra from "~/services/alegra.server"
import {
  createContactRequestSchema,
  createInvoiceRequestSchema,
} from "~/utils/alegra"
import { AlegraError, SchemaValidationError } from "~/utils/error"
import { InternalServerError, OK, Unauthorized } from "~/utils/http.server"
import { logger } from "~/utils/log"
import { orderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { verifyWebhook } from "~/utils/shopify.server"

export async function action({ request }: ActionArgs): Promise<Response> {
  const verified = await verifyWebhook(request)

  if (!verified) {
    return Unauthorized
  }

  const body = await request.json()

  try {
    const order = orderPaymentWebhookPayloadSchema.parse(body)

    const contactRequest = createContactRequestSchema.parse({
      address: {
        address: order.billing_address.address1,
        city: order.billing_address.city,
      },
      email: order.customer.email,
      name: `${order.customer.first_name} ${order.customer.last_name}`,
      phonePrimary: order.billing_address.phone,
      type: "client",
    })

    // Create the contact
    // TODO(adelrodriguez): Check if the contact already exists (by email). If
    // it already exists, then grab the id from there.
    const contact = await alegra.contacts.create(contactRequest)

    const { exchangeRate } = await alegra.currencies.get({
      code: order.currency,
    })
    const shippingLine = order.shipping_lines[0]
    const shippingFee = shippingLine
      ? currency(shippingLine.price).multiply(exchangeRate).value
      : 0

    const invoiceRequest = createInvoiceRequestSchema.parse({
      anotation: `Para Order No. ${order.number}`,
      client: contact.id,
      comments: [`Order No. ${order.number}`],
      date: order.processed_at,
      dueDate: order.processed_at,
      items: [
        {
          id: ALEGRA_SERVICE_ITEM_ID,
          price: shippingFee,
          quantity: 1,
        },
      ],
      status: "open",
    })

    const invoice = await alegra.invoices.create(invoiceRequest)
    const invoiceNumber = invoice.numberTemplate.fullNumber

    logger.info(`Invoice ${invoiceNumber} created for order ${order.number}`)

    const emails = [contact.email, ALEGRA_INVOICE_BACKUP_EMAIL]

    const response = await alegra.invoices.send({ emails, id: invoice.id })

    logger.info(`Invoice ${invoiceNumber}: ${response.message}`)

    return OK
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("Error parsing request body")
      logger.error(error.message, { error })

      // Return OK so Shopify doesn't retry the webhook
      return OK
    }

    if (error instanceof AlegraError) {
      logger.error("Alegra API Error")
      logger.error(error.message, { error })

      // Return OK so Shopify doesn't retry the webhook
      return OK
    }

    if (error instanceof SchemaValidationError) {
      logger.error("Error parsing response body")
      logger.error(error.message, { error })

      // Return OK so Shopify doesn't retry the webhook
      return OK
    }

    return InternalServerError
  }
}
