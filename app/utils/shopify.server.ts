import request from "graphql-request"

import { SHIPPING_METHOD } from "~/config/consts"
import {
  shopifyAdminAPInHeaders,
  shopifyAdminAPIEndpoint,
} from "~/config/vars.server"
import type { DraftOrderLineItemInput } from "~/services/shopify/admin"
import {
  draftOrderCreateMutation,
  getOrderQuery,
} from "~/services/shopify/admin"
import type { CartItem } from "~/utils/cart"
import { ShopifyError } from "~/utils/error"

export async function createCheckout(
  cartItems: CartItem[],
  shipping: number,
  note: string,
  meta: {
    sku: string
    listingId: string
  }
) {
  const lineItems: DraftOrderLineItemInput[] = cartItems.map((cartItem) => ({
    quantity: cartItem.quantity,
    variantId: cartItem.variantId,
  }))

  // Add the shipping item
  lineItems.push({
    originalUnitPrice: shipping,
    quantity: 1,
    title: SHIPPING_METHOD,
  })

  const response = await request(
    shopifyAdminAPIEndpoint,
    draftOrderCreateMutation,
    {
      input: {
        lineItems,
        note,
        tags: [`listing-${meta.sku}`, meta.listingId],
      },
    },
    shopifyAdminAPInHeaders
  )

  const id = response.draftOrderCreate?.draftOrder?.id
  const url = response.draftOrderCreate?.draftOrder?.invoiceUrl

  if (!id || !url) {
    throw new ShopifyError(
      "Unable to create checkout",
      "draft_order_create_error"
    )
  }

  return { id, url }
}

export async function getOrder(id: string) {
  const { order } = await request(
    shopifyAdminAPIEndpoint,
    getOrderQuery,
    {
      id,
    },
    shopifyAdminAPInHeaders
  )

  if (!order) {
    throw new ShopifyError("Unable to get order", "order_get_error")
  }

  return order
}
