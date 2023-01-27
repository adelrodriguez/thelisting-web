import request from "graphql-request"

import {
  shopifyAdminAPInHeaders,
  shopifyAdminAPIEndpoint,
} from "~/config/vars.server"
import type { DraftOrderLineItemInput } from "~/services/shopify/admin"
import { getOrderTagsQuery } from "~/services/shopify/admin"
import {
  draftOrderCreateMutation,
  getOrderQuery,
} from "~/services/shopify/admin"
import type { CartItem } from "~/utils/cart"
import { ShopifyError } from "~/utils/error"

export async function createCheckout(
  cartItems: CartItem[],
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
    quantity: 1,
    variantId: "gid://shopify/ProductVariant/41558180102191",
  })

  const response = await request(
    shopifyAdminAPIEndpoint,
    draftOrderCreateMutation,
    {
      input: {
        lineItems,
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

export async function getOrderTags(id: string) {
  const { order } = await request(
    shopifyAdminAPIEndpoint,
    getOrderTagsQuery,
    {
      id,
    },
    shopifyAdminAPInHeaders
  )

  if (!order) {
    throw new ShopifyError("Unable to get order", "order_get_error")
  }

  return order.tags
}
