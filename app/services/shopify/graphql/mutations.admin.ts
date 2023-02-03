import { graphql } from "~/services/shopify/admin/gql"

export const createProductMutation = graphql(`
  mutation createProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
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
