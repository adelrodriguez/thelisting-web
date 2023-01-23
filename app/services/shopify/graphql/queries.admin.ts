import { graphql } from "../admin/gql"

export const getOrderQuery = graphql(`
  query getOrder($id: ID!) {
    order(id: $id) {
      id
      name
      createdAt
      processedAt
      currencyCode
      customer {
        firstName
        lastName
        displayName
        email
      }
      billingAddress {
        address1
        address2
        city
        phone
      }
      transactions {
        createdAt
        processedAt
      }
      tags
    }
  }
`)
