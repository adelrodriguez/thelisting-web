import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import { graphql } from "~/services/shopify/storefront"

const localization = graphql(`
  query getLocalization {
    localization {
      availableLanguages {
        isoCode
        name
        endonymName
      }
      country {
        currency {
          isoCode
          symbol
        }
      }
    }
  }
`)

export default function useLocalization() {
  return useQuery(["localization"], async () =>
    request(
      window.env.shopifyStorefrontEndpoint,
      localization,
      {},
      {
        "X-Shopify-Storefront-Access-Token":
          window.env.shopifyStorefrontAccessToken,
      }
    )
  )
}
