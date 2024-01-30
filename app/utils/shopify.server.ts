import type { Listing } from "@prisma/client"
import request from "graphql-request"

import type { CustomAttribute } from "~/config/consts"
import { PRODUCT_METAFIELDS, CUSTOM_ATTRIBUTES } from "~/config/consts"
import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import {
  shopifyAdminAPIHeaders,
  shopifyAdminAPIEndpoint,
  shopifyStorefrontAPIEndpoint,
  shopifyStorefrontAPIHeaders,
} from "~/config/vars.server"
import logger from "~/helpers/logger.server"
import {
  getOrderCustomAttributesQuery,
  getProductsByTagQuery,
  createProductMutation,
  publishToCurrentChannelMutation,
  createCollectionMutation,
  addProductsToCollectionMutation,
  addTagsMutation,
  removeProductsFromCollectionMutation,
  getOrderQuery,
  createProductMediaMutation,
  MediaContentType,
  getCollectionQuery,
  getProductWithMetafieldsQuery,
  getProductQuery,
} from "~/services/shopify/admin"
import { createCheckoutMutation } from "~/services/shopify/storefront"
import type { CartItem } from "~/utils/cart"
import { ShopifyError } from "~/utils/error"
import { transformCustomAttributes } from "~/utils/shopify"

export async function createCheckout(
  cartItems: CartItem[],
  meta: {
    sku: string
    listingId: string
    noteId?: string
    sessionCartsKey: string // The session id used to identify the user's cart in Redis
  },
) {
  const lineItems = cartItems.map(({ quantity, variantId }) => ({
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
    {
      input: {
        customAttributes,
        lineItems,
      },
    },
    shopifyStorefrontAPIHeaders,
  )

  const id = checkoutCreate?.checkout?.id
  const url = checkoutCreate?.checkout?.webUrl

  if (!id || !url) {
    logger.error("Unable to create checkout", {
      userErrors: checkoutCreate?.userErrors,
    })
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
    shopifyAdminAPIHeaders,
  )

  if (!order) {
    throw new ShopifyError("Unable to get order", "order_get_error")
  }

  return order
}

export async function getOrderCustomAttributes(id: string) {
  const { order } = await request(
    shopifyAdminAPIEndpoint,
    getOrderCustomAttributesQuery,
    {
      id,
    },
    shopifyAdminAPIHeaders,
  )

  if (!order) {
    throw new ShopifyError("Unable to get order", "order_get_error")
  }

  return transformCustomAttributes(order.customAttributes)
}

export async function createProduct({
  collection,
  cost,
  currency,
  description,
  images,
  originalAmount,
  price,
  store,
  tags,
  title,
  url,
}: {
  collection: Listing["commerceId"]
  cost: number
  currency: string
  description?: string | null
  images: {
    src?: string | null
    alt?: string | null
  }[]
  originalAmount?: number | null
  url?: string | null
  price: number
  store?: string | null
  tags: string[]
  title?: string | null
}) {
  const { productCreate } = await request(
    shopifyAdminAPIEndpoint,
    createProductMutation,
    {
      input: {
        collectionsToJoin: collection ? [collection] : undefined,
        descriptionHtml: description,
        metafields: [
          {
            key: PRODUCT_METAFIELDS.OriginalUrl,
            namespace: "original_product",
            type: "url",
            value: url,
          },
          {
            key: PRODUCT_METAFIELDS.OriginalTitle,
            namespace: "original_product",
            type: "single_line_text_field",
            value: title,
          },
          {
            key: PRODUCT_METAFIELDS.OriginalDescription,
            namespace: "original_product",
            type: "multi_line_text_field",
            value: description,
          },
          {
            key: PRODUCT_METAFIELDS.OriginalPrice,
            namespace: "original_product",
            type: "number_decimal",
            value: originalAmount?.toString(),
          },
          {
            key: PRODUCT_METAFIELDS.OriginalCurrency,
            namespace: "original_product",
            type: "single_line_text_field",
            value: currency,
          },
        ],
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
    shopifyAdminAPIHeaders,
  )

  if (!productCreate?.product) {
    logger.error("Unable to create product", {
      userErrors: productCreate?.userErrors,
    })
    throw new ShopifyError("Unable to create product", "product_create_error")
  }

  if (images.length > 0) {
    const { productCreateMedia } = await request(
      shopifyAdminAPIEndpoint,
      createProductMediaMutation,
      {
        media: images.map(({ alt, src }) => ({
          alt: alt,
          mediaContentType: MediaContentType.Image,
          originalSource: src ?? "",
        })),
        productId: productCreate.product.id,
      },
      shopifyAdminAPIHeaders,
    )

    if (!productCreateMedia?.media) {
      logger.error("Unable to media for product", {
        userErrors: productCreateMedia?.mediaUserErrors,
      })
      throw new ShopifyError(
        "Unable to create product media",
        "product_media_create_error",
      )
    }
  }

  return productCreate.product
}

export async function getProductWithMetafields(id: string) {
  const { product } = await request(
    shopifyAdminAPIEndpoint,
    getProductWithMetafieldsQuery,
    {
      id,
    },
    shopifyAdminAPIHeaders,
  )

  if (!product) {
    logger.error("Unable to get product", {
      code: "product_with_metafields_get_error",
      id,
    })
    throw new ShopifyError(
      "Unable to get product",
      "product_with_metafields_get_error",
    )
  }

  return product
}

export async function getProductsByTag(tag: string) {
  const { products } = await request(
    shopifyAdminAPIEndpoint,
    getProductsByTagQuery,
    {
      query: "tag:" + tag,
    },
    shopifyAdminAPIHeaders,
  )

  return products.edges.filter(Boolean).map((product) => product.node)
}

export async function publishToCurrentChannel(id: string) {
  const { publishablePublishToCurrentChannel } = await request(
    shopifyAdminAPIEndpoint,
    publishToCurrentChannelMutation,
    {
      id,
    },
    shopifyAdminAPIHeaders,
  )

  if (!publishablePublishToCurrentChannel?.publishable) {
    throw new ShopifyError(
      "Unable to publish product to current channel",
      "product_publish_error",
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
    shopifyAdminAPIHeaders,
  )

  if (!collectionCreate?.collection) {
    throw new ShopifyError(
      "Unable to create collection",
      "collection_create_error",
    )
  }

  return collectionCreate.collection
}

export async function addProductsToCollection(
  collectionId: string,
  productIds: string[],
) {
  const { collectionAddProducts } = await request(
    shopifyAdminAPIEndpoint,
    addProductsToCollectionMutation,
    {
      id: collectionId,
      productIds,
    },
    shopifyAdminAPIHeaders,
  )

  if (!collectionAddProducts?.collection) {
    logger.error("Unable to add products to collection", {
      userErrors: collectionAddProducts?.userErrors,
    })
    throw new ShopifyError(
      "Unable to add products to collection",
      "add_products_to_collection_error",
    )
  }

  return collectionAddProducts.collection
}

export async function removeProductsFromCollection(
  collectionId: string,
  productIds: string[],
) {
  const { collectionRemoveProducts } = await request(
    shopifyAdminAPIEndpoint,
    removeProductsFromCollectionMutation,
    {
      id: collectionId,
      productIds,
    },
    shopifyAdminAPIHeaders,
  )

  if (!collectionRemoveProducts?.job) {
    logger.error("Unable to remove products from collection", {
      userErrors: collectionRemoveProducts?.userErrors,
    })
    throw new ShopifyError(
      "Unable to remove products from collection",
      "remove_products_from_collection_error",
    )
  }

  return collectionRemoveProducts.job
}

export async function addTags(id: string, tags: string[]) {
  const { tagsAdd } = await request(
    shopifyAdminAPIEndpoint,
    addTagsMutation,
    {
      id,
      tags,
    },
    shopifyAdminAPIHeaders,
  )

  if (!tagsAdd?.node?.id) {
    logger.error("Unable to create checkout", {
      userErrors: tagsAdd?.userErrors,
    })

    throw new ShopifyError("Unable to create tags", "checkout_create_error")
  }

  return true
}

export async function getCollection(id: string) {
  const { collection } = await request(
    shopifyAdminAPIEndpoint,
    getCollectionQuery,
    {
      id,
    },
    shopifyAdminAPIHeaders,
  )

  if (!collection) {
    throw new ShopifyError("Unable to get collection", "collection_get_error")
  }

  return collection
}

export async function getProduct(id: string) {
  const { product } = await request(
    shopifyAdminAPIEndpoint,
    getProductQuery,
    {
      id,
    },
    shopifyAdminAPIHeaders,
  )

  if (!product) {
    logger.error("Unable to get product", {
      code: "product_get_error",
      id,
    })
    throw new ShopifyError("Unable to get product", "product_get_error")
  }

  return product
}
