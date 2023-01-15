import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  // schema: ,
  documents: ["app/**/*.tsx", "app/**/*.ts", "app/**/*.graphql"],
  generates: {
    "app/services/shopify/storefront/": {
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
