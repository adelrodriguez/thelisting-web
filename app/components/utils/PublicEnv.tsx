type PublicEnvs = {
  environment: "development" | "production" | "test"
  posthogHost: string
  posthogApiKey: string
  release?: string | undefined
  sentryDsn?: string | undefined
  shopifyStore: string
  shopifyStorefrontAccessToken: string
  shopifyStorefrontAPIEndpoint: string
}

declare global {
  interface Window {
    env: PublicEnvs
  }
}

export default function PublicEnv(props: PublicEnvs) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.env = ${JSON.stringify(props)}`,
      }}
    />
  )
}
