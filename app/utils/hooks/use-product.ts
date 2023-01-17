import type { UseQueryResult } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import { getProduct } from "~/services/shopify/storefront"
import type { GetProductQuery } from "~/services/shopify/storefront"

export default function useProduct(
  id: string
): UseQueryResult<GetProductQuery> {
  return useQuery(["products", id], async () =>
    request(
      window.env.shopifyStorefrontAPIEndpoint,
      getProduct,
      {
        id,
      },
      {
        "X-Shopify-Storefront-Access-Token":
          window.env.shopifyStorefrontAccessToken,
      }
    )
  )
}
