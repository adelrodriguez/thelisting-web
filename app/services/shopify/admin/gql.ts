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
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  mutation draftOrderCreate($input: DraftOrderInput!) {\n    draftOrderCreate(input: $input) {\n      draftOrder {\n        id\n        invoiceUrl\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": types.DraftOrderCreateDocument,
    "\n  query getOrderTags($id: ID!) {\n    order(id: $id) {\n      tags\n    }\n  }\n": types.GetOrderTagsDocument,
    "\n  query getOrderCustomAttributes($id: ID!) {\n    order(id: $id) {\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n": types.GetOrderCustomAttributesDocument,
    "\n  query getOrder($id: ID!) {\n    order(id: $id) {\n      id\n      name\n      createdAt\n      processedAt\n      currencyCode\n      customer {\n        firstName\n        lastName\n        displayName\n        email\n      }\n      billingAddress {\n        address1\n        address2\n        city\n        country\n        zip\n        phone\n      }\n      transactions {\n        createdAt\n        processedAt\n      }\n      tags\n      customAttributes {\n        key\n        value\n      }\n      lineItems(first: 250) {\n        nodes {\n          id\n          quantity\n          product {\n            id\n          }\n        }\n      }\n      totalPriceSet {\n        presentmentMoney {\n          amount\n          currencyCode\n        }\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n": types.GetOrderDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation draftOrderCreate($input: DraftOrderInput!) {\n    draftOrderCreate(input: $input) {\n      draftOrder {\n        id\n        invoiceUrl\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation draftOrderCreate($input: DraftOrderInput!) {\n    draftOrderCreate(input: $input) {\n      draftOrder {\n        id\n        invoiceUrl\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n"];
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
export function graphql(source: "\n  query getOrder($id: ID!) {\n    order(id: $id) {\n      id\n      name\n      createdAt\n      processedAt\n      currencyCode\n      customer {\n        firstName\n        lastName\n        displayName\n        email\n      }\n      billingAddress {\n        address1\n        address2\n        city\n        country\n        zip\n        phone\n      }\n      transactions {\n        createdAt\n        processedAt\n      }\n      tags\n      customAttributes {\n        key\n        value\n      }\n      lineItems(first: 250) {\n        nodes {\n          id\n          quantity\n          product {\n            id\n          }\n        }\n      }\n      totalPriceSet {\n        presentmentMoney {\n          amount\n          currencyCode\n        }\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query getOrder($id: ID!) {\n    order(id: $id) {\n      id\n      name\n      createdAt\n      processedAt\n      currencyCode\n      customer {\n        firstName\n        lastName\n        displayName\n        email\n      }\n      billingAddress {\n        address1\n        address2\n        city\n        country\n        zip\n        phone\n      }\n      transactions {\n        createdAt\n        processedAt\n      }\n      tags\n      customAttributes {\n        key\n        value\n      }\n      lineItems(first: 250) {\n        nodes {\n          id\n          quantity\n          product {\n            id\n          }\n        }\n      }\n      totalPriceSet {\n        presentmentMoney {\n          amount\n          currencyCode\n        }\n        shopMoney {\n          amount\n          currencyCode\n        }\n      }\n      customAttributes {\n        key\n        value\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;