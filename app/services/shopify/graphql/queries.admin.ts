import { graphql } from "../admin/gql"

export const getOrderQuery = graphql(`
  query getOrder($id: ID!) {
    order(id: $id) {
      id
      tags
    }
  }
`)
