import type { MetaFunction, LinksFunction, LoaderArgs } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"
import { withSentry } from "@sentry/remix"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useTranslation } from "react-i18next"
import remixImageStyles from "remix-image/remix-image.css"

import { RootError } from "~/components/error"
import { PublicEnv } from "~/components/utils"
import { SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "~/config/env.server"
import {
  shopifyStorefrontAPIEndpoint,
  xStateVisualizer,
} from "~/config/vars.server"
import i18next from "~/helpers/i18next.server"
import tailwind from "~/styles/tailwind.css"
import { useChangeLanguage } from "~/utils/hooks"
import { i18nCookie } from "~/utils/i18next"
import { json, useLoaderData } from "~/utils/remix"

const client = new QueryClient()

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  description: "Coming soon",
  title: "The Listing",
  viewport: "width=device-width,initial-scale=1",
})

export const links: LinksFunction = () => [
  { href: tailwind, rel: "stylesheet" },
  { href: remixImageStyles, rel: "stylesheet" },
  {
    href: "https://use.typekit.net/vno7ewy.css",
    rel: "stylesheet",
  },
]

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <RootError
      status={caught.status}
      statusText={caught.statusText}
      data={caught.data}
    />
  )
}

export async function loader({ request }: LoaderArgs) {
  const locale = await i18next.getLocale(request)

  return json(
    {
      env: {
        shopifyStorefrontAPIEndpoint,
        shopifyStorefrontAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        xStateVisualizer,
      },
      locale,
    },
    {
      headers: {
        "Set-Cookie": await i18nCookie.serialize(locale),
      },
    }
  )
}

function App() {
  const { env, locale } = useLoaderData<typeof loader>()
  const { i18n } = useTranslation()

  useChangeLanguage(locale)

  return (
    <html className="h-full" lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-auto min-h-full">
        <QueryClientProvider client={client}>
          <Outlet />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        <PublicEnv {...env} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default withSentry(App)
