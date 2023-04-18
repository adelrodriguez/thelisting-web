import { flattenConnection } from "@shopify/hydrogen-react"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import { getProductQuery } from "~/services/shopify/storefront"

export default function useProduct(id: string) {
  return useQuery(
    ["products", id],
    async () =>
      request(
        window.env.shopifyStorefrontAPIEndpoint,
        getProductQuery,
        {
          id,
        },
        {
          "X-Shopify-Storefront-Access-Token":
            window.env.shopifyStorefrontAccessToken,
        }
      ),
    {
      select: (data) => {
        if (!data.product) {
          throw new Error("Product not found")
        }

        const variant = flattenConnection(data.product?.variants)[0]
        const imageUrl = variant?.image?.url
        const price = variant?.price!.amount as number
        const currencyCode = variant?.price!.currencyCode
        const title = data.product?.title!
        const variantId = variant?.id!

        return { currencyCode, imageUrl, price, title, variantId }
      },
    }
  )
}
