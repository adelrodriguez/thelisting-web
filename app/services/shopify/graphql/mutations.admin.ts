import { graphql } from "app/services/shopify/admin/gql"

export const CreateDraftOrder = graphql(`
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        invoiceUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`)
