import type { UseQueryResult } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import { graphql } from "~/services/shopify/storefront"
import type { GetProductQuery } from "~/services/shopify/storefront"

const product = graphql(`
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      variants(first: 1) {
        nodes {
          id
          price {
            amount
            currencyCode
          }
          image {
            altText
            url
            width
          }
        }
      }
    }
  }
`)

export default function useProduct(
  id: string
): UseQueryResult<GetProductQuery> {
  return useQuery(["products", id], async () =>
    request(
      window.env.shopifyStorefrontEndpoint,
      product,
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
