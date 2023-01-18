import { graphql } from "../storefront/gql"

export const getProductQuery = graphql(`
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

export const getLocalizationQuery = graphql(`
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
