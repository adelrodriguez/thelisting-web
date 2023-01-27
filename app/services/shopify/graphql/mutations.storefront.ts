import { graphql } from "~/services/shopify/storefront/gql"

export const createCheckoutMutation = graphql(`
  mutation createCheckout($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`)
