import type { UseQueryResult } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import type { GetLocalizationQuery } from "~/services/shopify/storefront"
import { getLocalizationQuery } from "~/services/shopify/storefront"

export default function useLocalization(): UseQueryResult<GetLocalizationQuery> {
  return useQuery(["localization"], async () =>
    request(
      window.env.shopifyStorefrontAPIEndpoint,
      getLocalizationQuery,
      {},
      {
        "X-Shopify-Storefront-Access-Token":
          window.env.shopifyStorefrontAccessToken,
      },
    ),
  )
}
