import { graphql } from "app/services/shopify/storefront"

export const getProduct = graphql(`
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

export const getLocalization = graphql(`
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
