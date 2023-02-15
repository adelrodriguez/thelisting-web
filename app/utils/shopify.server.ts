import type { Listing } from "@prisma/client"
import request from "graphql-request"

import type { CustomAttribute } from "~/config/consts"
import { CUSTOM_ATTRIBUTES } from "~/config/consts"
import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import {
  shopifyAdminAPInHeaders,
  shopifyAdminAPIEndpoint,
  shopifyStorefrontAPIEndpoint,
  shopifyStorefrontAPInHeaders,
} from "~/config/vars.server"
import Sentry from "~/services/sentry"
import {
  getOrderCustomAttributesQuery,
  getOrderTagsQuery,
  searchProducts,
  createProductMutation,
  publishToCurrentChannelMutation,
  createCollectionMutation,
  addProductsToCollectionMutation,
} from "~/services/shopify/admin"
import { getOrderQuery } from "~/services/shopify/admin"
import { createCheckoutMutation } from "~/services/shopify/storefront"
import type { CartItem } from "~/utils/cart"
import { ShopifyError } from "~/utils/error"
import { logger } from "~/utils/log"
import { transformCustomAttributes } from "~/utils/shopify"

export async function createCheckout(
  cartItems: CartItem[],
  meta: {
    sku: string
    listingId: string
    noteId?: string
    sessionCartsKey: string // The session id used to identify the user's cart in Redis
  }
) {
  const lineItems = cartItems.map(({ variantId, quantity }) => ({
    quantity,
    variantId,
  }))

  lineItems.push({
    quantity: 1,
    variantId: SHOPIFY_SHIPPING_ITEM_1_ID,
  })

  const customAttributes: Array<{ key: CustomAttribute; value: string }> = [
    {
      key: CUSTOM_ATTRIBUTES.ListingId,
      value: meta.listingId,
    },
    {
      key: CUSTOM_ATTRIBUTES.ListingSku,
      value: meta.sku,
    },
    {
      key: CUSTOM_ATTRIBUTES.SessionCartsKey,
      value: meta.sessionCartsKey,
    },
  ]

  if (meta.noteId) {
    customAttributes.push({
      key: CUSTOM_ATTRIBUTES.NoteId,
      value: meta.noteId,
    })
  }

  const { checkoutCreate } = await request(
    shopifyStorefrontAPIEndpoint,
    createCheckoutMutation,
    { input: { customAttributes, lineItems } },
    shopifyStorefrontAPInHeaders
  )

  const id = checkoutCreate?.checkout?.id
  const url = checkoutCreate?.checkout?.webUrl

  if (!id || !url) {
    logger.error("Unable to create checkout", {
      userErrors: checkoutCreate?.userErrors,
    })
    Sentry.captureException(checkoutCreate?.userErrors)
    throw new ShopifyError("Unable to create checkout", "checkout_create_error")
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

  return transformCustomAttributes(order.customAttributes)
}

export async function createProduct({
  title,
  description,
  tags,
  images,
  price,
  store,
  collection,
  cost,
}: {
  title?: string | null
  description?: string | null
  tags: string[]
  images: {
    src?: string | null
    altText?: string | null
  }[]
  price: number
  cost: number
  store?: string | null
  collection: Listing["commerceId"]
}) {
  const { productCreate } = await request(
    shopifyAdminAPIEndpoint,
    createProductMutation,
    {
      input: {
        collectionsToJoin: [collection!],
        descriptionHtml: description,
        images,
        tags,
        title,
        variants: [
          {
            inventoryItem: {
              cost,
              tracked: false,
            },
            price,
            requiresShipping: false,
            taxable: false,
          },
        ],
        vendor: store,
      },
    },
    shopifyAdminAPInHeaders
  )

  if (!productCreate?.product) {
    logger.error("Unable to create checkout", {
      userErrors: productCreate?.userErrors,
    })
    Sentry.captureException(productCreate?.userErrors)
    throw new ShopifyError("Unable to create product", "product_create_error")
  }

  return productCreate.product
}

export async function getProductsByTag(tag: string) {
  const { products } = await request(
    shopifyAdminAPIEndpoint,
    searchProducts,
    {
      query: "tag:" + tag,
    },
    shopifyAdminAPInHeaders
  )

  return products.edges.map((product) => product!.node)
}

export async function publishToCurrentChannel(id: string) {
  const { publishablePublishToCurrentChannel } = await request(
    shopifyAdminAPIEndpoint,
    publishToCurrentChannelMutation,
    {
      id,
    },
    shopifyAdminAPInHeaders
  )

  if (!publishablePublishToCurrentChannel?.publishable) {
    throw new ShopifyError(
      "Unable to publish product to current channel",
      "product_publish_error"
    )
  }

  return publishablePublishToCurrentChannel.publishable
    .publishedOnCurrentPublication
}

export async function createCollection({ sku }: { sku: number }) {
  const { collectionCreate } = await request(
    shopifyAdminAPIEndpoint,
    createCollectionMutation,
    {
      input: {
        title: `Listing ${sku}`,
      },
    },
    shopifyAdminAPInHeaders
  )

  if (!collectionCreate?.collection) {
    throw new ShopifyError(
      "Unable to create collection",
      "collection_create_error"
    )
  }

  return collectionCreate.collection
}

export async function addProductsToCollection(
  collectionId: string,
  productIds: string[]
) {
  const { collectionAddProducts } = await request(
    shopifyAdminAPIEndpoint,
    addProductsToCollectionMutation,
    {
      id: collectionId,
      productIds,
    },
    shopifyAdminAPInHeaders
  )

  if (!collectionAddProducts?.collection) {
    throw new ShopifyError(
      "Unable to add products to collection",
      "add_products_to_collection_error"
    )
  }

  return collectionAddProducts.collection
}
