import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  useLoaderData,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  useLocation,
} from "@remix-run/react"
import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import posthog from "posthog-js"
import { useEffect, type ComponentProps } from "react"
import { useTranslation } from "react-i18next"

import { NotFound } from "~/components/error"
import { PublicEnv } from "~/components/utils"
import { isProduction } from "~/config/vars"
import { shopifyStorefrontAPIEndpoint } from "~/config/vars.server"
import i18next from "~/helpers/i18next.server"
import stylesheet from "~/styles/app.css"
import { ExchangeRateProvider, useChangeLanguage } from "~/utils/hooks"
import { i18nCookie } from "~/utils/i18n"

const client = new QueryClient()

export const links: LinksFunction = () => [
  { href: stylesheet, rel: "stylesheet" },
  {
    href: "https://use.typekit.net/vno7ewy.css",
    rel: "stylesheet",
  },
]

// TODO(adelrodriguez): Improve this error page
export function ErrorBoundary() {
  const error = useRouteError()

  if (!isRouteErrorResponse(error)) {
    if (isProduction) {
      return (
        <NotFound
          data={{ message: "Not found", title: "Not found" }}
          status={500}
        />
      )
    }

    return (
      <html lang="en">
        <head>
          <title>Error</title>
        </head>
        <body>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </body>
      </html>
    )
  }

  captureRemixErrorBoundaryError(error)

  return <NotFound data={error.data} status={error.status} />
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request)
  const env = context.env

  const publicEnv: ComponentProps<typeof PublicEnv> = {
    environment: env.NODE_ENV,
    posthogApiKey: env.POSTHOG_API_KEY,
    posthogHost: env.POSTHOG_HOST,
    release: env.RAILWAY_GIT_COMMIT_SHA,
    sentryDsn: env.SENTRY_DSN,
    shopifyStore: env.SHOPIFY_STORE,
    shopifyStorefrontAPIEndpoint,
    shopifyStorefrontAccessToken: env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  }

  return json(
    {
      env: publicEnv,
      locale,
    },
    {
      headers: {
        "Set-Cookie": await i18nCookie.serialize(locale),
      },
    },
  )
}

export const meta: MetaFunction<typeof loader> = () => [
  { title: "The Listing" },
  {
    content:
      "Listas de regalo personalizadas para todo tipo de eventos. Te permitimos elegir artículos de cualquier tienda que desees; logistica de compra y entrega incluida.",
    name: "description",
  },
  { charSet: "utf-8" },
  { content: "width=device-width, initial-scale=1", name: "viewport" },
]

function App() {
  const { env, locale } = useLoaderData<typeof loader>()
  const { i18n } = useTranslation()
  const location = useLocation()

  // Change the language of the app based on the locale
  useChangeLanguage(locale)

  // Init PostHog analytics tracking
  useEffect(() => {
    posthog.init(env.posthogApiKey, {
      api_host: env.posthogHost,
      autocapture: isProduction,
      capture_pageview: false,
    })
  }, [env.posthogApiKey, env.posthogHost])

  // Capture all page views
  useEffect(() => {
    posthog.capture("$pageview")
  }, [location])

  return (
    <html className="h-full" dir={i18n.dir()} lang={locale}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-auto min-h-full">
        <QueryClientProvider client={client}>
          <ExchangeRateProvider>
            <Outlet />
            <ReactQueryDevtools initialIsOpen={false} />
          </ExchangeRateProvider>
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
