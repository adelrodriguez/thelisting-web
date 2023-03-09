/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  mutation createProduct($input: ProductInput!) {\n    productCreate(input: $input) {\n      product {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": types.CreateProductDocument,
    "\n  mutation publishablePublishToCurrentChannel($id: ID!) {\n    publishablePublishToCurrentChannel(id: $id) {\n      publishable {\n        publishedOnCurrentPublication\n      }\n    }\n  }\n": types.PublishablePublishToCurrentChannelDocument,
    "\n  mutation createCollection($input: CollectionInput!) {\n    collectionCreate(input: $input) {\n      collection {\n        id\n      }\n    }\n  }\n": types.CreateCollectionDocument,
    "\n  mutation addProductsToCollection($id: ID!, $productIds: [ID!]!) {\n    collectionAddProducts(id: $id, productIds: $productIds) {\n      collection {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": types.AddProductsToCollectionDocument,
    "\n  query getOrderTags($id: ID!) {\n    order(id: $id) {\n      tags\n    }\n  }\n": types.GetOrderTagsDocument,
    "\n  query getOrderCustomAttributes($id: ID!) {\n    order(id: $id) {\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n": types.GetOrderCustomAttributesDocument,
    "\n  query getOrder($id: ID!) {\n    order(id: $id) {\n      id\n      name\n      createdAt\n      processedAt\n      currencyCode\n      customer {\n        id\n        firstName\n        lastName\n        displayName\n        email\n      }\n      billingAddress {\n        address1\n        address2\n        city\n        country\n        zip\n        phone\n      }\n      tags\n      customAttributes {\n        key\n        value\n      }\n      lineItems(first: 20) {\n        nodes {\n          id\n          quantity\n          product {\n            id\n            title\n            variants(first: 1) {\n              nodes {\n                id\n                price\n                inventoryItem {\n                  unitCost {\n                    amount\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n      totalPriceSet {\n        presentmentMoney {\n          amount\n          currencyCode\n        }\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n": types.GetOrderDocument,
    "\n  query getProductsByTag($query: String!) {\n    products(first: 10, query: $query) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n  }\n": types.GetProductsByTagDocument,
    "\n  query getProduct($id: ID!) {\n    product(id: $id) {\n      title\n      vendor\n      metafields(first: 10) {\n        nodes {\n          key\n          namespace\n          value\n        }\n      }\n    }\n  }\n": types.GetProductDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createProduct($input: ProductInput!) {\n    productCreate(input: $input) {\n      product {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createProduct($input: ProductInput!) {\n    productCreate(input: $input) {\n      product {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation publishablePublishToCurrentChannel($id: ID!) {\n    publishablePublishToCurrentChannel(id: $id) {\n      publishable {\n        publishedOnCurrentPublication\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation publishablePublishToCurrentChannel($id: ID!) {\n    publishablePublishToCurrentChannel(id: $id) {\n      publishable {\n        publishedOnCurrentPublication\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createCollection($input: CollectionInput!) {\n    collectionCreate(input: $input) {\n      collection {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createCollection($input: CollectionInput!) {\n    collectionCreate(input: $input) {\n      collection {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation addProductsToCollection($id: ID!, $productIds: [ID!]!) {\n    collectionAddProducts(id: $id, productIds: $productIds) {\n      collection {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation addProductsToCollection($id: ID!, $productIds: [ID!]!) {\n    collectionAddProducts(id: $id, productIds: $productIds) {\n      collection {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getOrderTags($id: ID!) {\n    order(id: $id) {\n      tags\n    }\n  }\n"): (typeof documents)["\n  query getOrderTags($id: ID!) {\n    order(id: $id) {\n      tags\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getOrderCustomAttributes($id: ID!) {\n    order(id: $id) {\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query getOrderCustomAttributes($id: ID!) {\n    order(id: $id) {\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getOrder($id: ID!) {\n    order(id: $id) {\n      id\n      name\n      createdAt\n      processedAt\n      currencyCode\n      customer {\n        id\n        firstName\n        lastName\n        displayName\n        email\n      }\n      billingAddress {\n        address1\n        address2\n        city\n        country\n        zip\n        phone\n      }\n      tags\n      customAttributes {\n        key\n        value\n      }\n      lineItems(first: 20) {\n        nodes {\n          id\n          quantity\n          product {\n            id\n            title\n            variants(first: 1) {\n              nodes {\n                id\n                price\n                inventoryItem {\n                  unitCost {\n                    amount\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n      totalPriceSet {\n        presentmentMoney {\n          amount\n          currencyCode\n        }\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query getOrder($id: ID!) {\n    order(id: $id) {\n      id\n      name\n      createdAt\n      processedAt\n      currencyCode\n      customer {\n        id\n        firstName\n        lastName\n        displayName\n        email\n      }\n      billingAddress {\n        address1\n        address2\n        city\n        country\n        zip\n        phone\n      }\n      tags\n      customAttributes {\n        key\n        value\n      }\n      lineItems(first: 20) {\n        nodes {\n          id\n          quantity\n          product {\n            id\n            title\n            variants(first: 1) {\n              nodes {\n                id\n                price\n                inventoryItem {\n                  unitCost {\n                    amount\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n      totalPriceSet {\n        presentmentMoney {\n          amount\n          currencyCode\n        }\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getProductsByTag($query: String!) {\n    products(first: 10, query: $query) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getProductsByTag($query: String!) {\n    products(first: 10, query: $query) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getProduct($id: ID!) {\n    product(id: $id) {\n      title\n      vendor\n      metafields(first: 10) {\n        nodes {\n          key\n          namespace\n          value\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getProduct($id: ID!) {\n    product(id: $id) {\n      title\n      vendor\n      metafields(first: 10) {\n        nodes {\n          key\n          namespace\n          value\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;