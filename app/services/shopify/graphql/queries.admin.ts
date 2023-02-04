import { graphql } from "~/services/shopify/admin/gql"

export const getOrderTagsQuery = graphql(`
  query getOrderTags($id: ID!) {
    order(id: $id) {
      tags
    }
  }
`)

export const getOrderCustomAttributesQuery = graphql(`
  query getOrderCustomAttributes($id: ID!) {
    order(id: $id) {
      customAttributes {
        key
        value
      }
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
      tags
      customAttributes {
        key
        value
      }
      lineItems(first: 20) {
        nodes {
          id
          quantity
          product {
            id
            title
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
      customAttributes {
        key
        value
      }
    }
  }
`)

export const searchProducts = graphql(`
  query getProductsByTag($query: String!) {
    products(first: 10, query: $query) {
      edges {
        node {
          id
        }
      }
    }
  }
`)
