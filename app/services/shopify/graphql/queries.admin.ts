import { graphql } from "../admin/gql"

export const getOrderTagsQuery = graphql(`
  query getOrderTags($id: ID!) {
    order(id: $id) {
      tags
    }
  }
`)

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
        country
        zip
        phone
      }
      transactions {
        createdAt
        processedAt
      }
      tags
      lineItems(first: 250) {
        nodes {
          id
          quantity
          product {
            id
          }
        }
      }
      totalPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
        shopMoney {
          amount
          currencyCode
        }
      }
      note
    }
  }
`)
