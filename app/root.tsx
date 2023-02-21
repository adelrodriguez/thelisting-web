import type { MetaFunction, LinksFunction, LoaderArgs } from "@remix-run/node"
import type { ThrownResponse } from "@remix-run/react"
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
import type { ComponentProps } from "react"
import { useTranslation } from "react-i18next"
import remixImageStyles from "remix-image/remix-image.css"

import type { NotFoundBoundaryData } from "~/components/error"
import { NotFound } from "~/components/error"
import { PublicEnv } from "~/components/utils"
import {
  GA_TRACKING_ID,
  RAILWAY_GIT_COMMIT_SHA,
  SENTRY_DSN,
  SHOPIFY_STORE,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
} from "~/config/env.server"
import {
  shopifyStorefrontAPIEndpoint,
  xStateVisualizer,
} from "~/config/vars.server"
import i18next from "~/helpers/i18next.server"
import stylesheet from "~/styles/app.css"
import { useChangeLanguage } from "~/utils/hooks"
import { i18nCookie } from "~/utils/i18next"
import { json, useLoaderData } from "~/utils/remix"

import { isProduction } from "./config/vars"

const client = new QueryClient()

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  description:
    "Listas de regalo personalizadas para todo tipo de eventos. Te permitimos elegir artículos de cualquier tienda que desees; logistica de compra y entrega incluida.",
  title: "The Listing",
  viewport: "width=device-width,initial-scale=1",
})

export const links: LinksFunction = () => [
  { href: stylesheet, rel: "stylesheet" },
  { href: remixImageStyles, rel: "stylesheet" },
  {
    href: "https://use.typekit.net/vno7ewy.css",
    rel: "stylesheet",
  },
]

export function CatchBoundary() {
  const caught = useCatch<ThrownResponse<number, NotFoundBoundaryData>>()

  return <NotFound status={caught.status} data={caught.data} />
}

export async function loader({ request }: LoaderArgs) {
  const locale = await i18next.getLocale(request)

  const env: ComponentProps<typeof PublicEnv> = {
    gaTrackingId: GA_TRACKING_ID,
    release: RAILWAY_GIT_COMMIT_SHA,
    sentryDsn: SENTRY_DSN,
    shopifyStore: SHOPIFY_STORE,
    shopifyStorefrontAPIEndpoint,
    shopifyStorefrontAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    xStateVisualizer,
  }

  return json(
    {
      env,
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
        {isProduction && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${env.gaTrackingId}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${env.gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}
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
