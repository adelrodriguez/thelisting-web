import { graphql } from "~/services/shopify/admin/gql"

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
        id
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
            variants(first: 1) {
              nodes {
                id
                price
                inventoryItem {
                  unitCost {
                    amount
                  }
                }
              }
            }
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

export const getProductsByTagQuery = graphql(`
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

export const getProductQuery = graphql(`
  query getProduct($id: ID!) {
    product(id: $id) {
      title
      vendor
      metafields(first: 10) {
        nodes {
          key
          namespace
          value
          type
        }
      }
    }
  }
`)
