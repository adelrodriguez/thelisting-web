type PublicEnvs = {
  shopifyStore: string
  shopifyStorefrontAccessToken: string
  shopifyStorefrontAPIEndpoint: string
  xStateVisualizer: boolean
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
