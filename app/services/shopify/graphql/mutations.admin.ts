import { graphql } from "~/services/shopify/admin/gql"

export const createProductMutation = graphql(`
  mutation createProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`)

export const publishToCurrentChannelMutation = graphql(`
  mutation publishablePublishToCurrentChannel($id: ID!) {
    publishablePublishToCurrentChannel(id: $id) {
      publishable {
        publishedOnCurrentPublication
      }
    }
  }
`)

export const createCollectionMutation = graphql(`
  mutation createCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
      }
    }
  }
`)

export const addProductsToCollectionMutation = graphql(`
  mutation addProductsToCollection($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`)
