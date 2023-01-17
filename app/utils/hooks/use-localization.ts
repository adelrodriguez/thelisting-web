import type { UseQueryResult } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import type { GetLocalizationQuery } from "~/services/shopify/storefront"
import { getLocalization } from "~/services/shopify/storefront"

export default function useLocalization(): UseQueryResult<GetLocalizationQuery> {
  return useQuery(["localization"], async () =>
    request(
      window.env.shopifyStorefrontAPIEndpoint,
      getLocalization,
      {},
      {
        "X-Shopify-Storefront-Access-Token":
          window.env.shopifyStorefrontAccessToken,
      }
    )
  )
}
