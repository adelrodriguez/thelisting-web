import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  // documents: "app/services/shopify/**/*.ts",
  generates: {
    "app/services/shopify/admin/": {
      documents: "app/services/shopify/graphql/*.admin.ts",
      plugins: [],
      preset: "client",
      schema: [
        {
          // We are using the environment variables directly since codegen can't
          // resolve the env schema path
          [`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`]:
            {
              headers: {
                "X-Shopify-Access-Token": `${process.env.SHOPIFY_ADMIN_ACCESS_TOKEN}`,
              },
            },
        },
      ],
    },
    "app/services/shopify/storefront/": {
      // documents: "app/services/shopify/storefront/{queries|mutations}.ts",
      documents: "app/services/shopify/graphql/*.storefront.ts",

      plugins: [],
      preset: "client",
      schema: [
        {
          // We are using the environment variables directly since codegen can't
          // resolve the env schema path
          [`https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`]:
            {
              headers: {
                "X-Shopify-Storefront-Access-Token": `${process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN}`,
              },
            },
        },
      ],
    },
  },
  ignoreNoDocuments: true, // for better experience with the watcher
}

export default config
