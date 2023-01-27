import request from "graphql-request"

import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import {
  shopifyAdminAPInHeaders,
  shopifyAdminAPIEndpoint,
  shopifyStorefrontAPIEndpoint,
  shopifyStorefrontAPInHeaders,
} from "~/config/vars.server"
import {
  getOrderCustomAttributesQuery,
  getOrderTagsQuery,
} from "~/services/shopify/admin"
import { getOrderQuery } from "~/services/shopify/admin"
import { createCheckoutMutation } from "~/services/shopify/storefront"
import type { CartItem } from "~/utils/cart"
import { ShopifyError } from "~/utils/error"

export async function createCheckout(
  cartItems: CartItem[],
  meta: {
    sku: string
    listingId: string
  }
) {
  const response = await request(
    shopifyStorefrontAPIEndpoint,
    createCheckoutMutation,
    {
      input: {
        customAttributes: [
          {
            key: "listing_id",
            value: meta.listingId,
          },
          {
            key: "listing_sku",
            value: meta.sku,
          },
        ],
        lineItems: [
          ...cartItems.map(({ variantId, quantity }) => ({
            quantity,
            variantId,
          })),
          // Add the shipping item
          {
            quantity: 1,
            variantId: SHOPIFY_SHIPPING_ITEM_1_ID,
          },
        ],
      },
    },
    shopifyStorefrontAPInHeaders
  )

  const id = response.checkoutCreate?.checkout?.id
  const url = response.checkoutCreate?.checkout?.webUrl

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

export async function getOrderCustomAttributes(id: string) {
  const { order } = await request(
    shopifyAdminAPIEndpoint,
    getOrderCustomAttributesQuery,
    {
      id,
    },
    shopifyAdminAPInHeaders
  )

  if (!order) {
    throw new ShopifyError("Unable to get order", "order_get_error")
  }

  return order.customAttributes
}
