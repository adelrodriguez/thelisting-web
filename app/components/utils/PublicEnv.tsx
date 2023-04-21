type PublicEnvs = {
  gaTrackingId: string
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
