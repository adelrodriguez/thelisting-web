import type { ReactElement } from "react"

export type PublicEnvs = {
  shopifyStorefrontAccessToken: string
  shopifyStorefrontAPIEndpoint: string
  xStateVisualizer: boolean
}

declare global {
  interface Window {
    env: PublicEnvs
  }
}

export default function PublicEnv(props: PublicEnvs): ReactElement {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.env = ${JSON.stringify(props)}`,
      }}
    />
  )
}
