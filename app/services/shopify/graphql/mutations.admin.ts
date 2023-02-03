import { graphql } from "~/services/shopify/admin/gql"

export const productCreateMutation = graphql(`
  mutation productCreate($input: ProductInput!) {
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
