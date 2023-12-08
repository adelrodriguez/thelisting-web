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
} from "@remix-run/react"
import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { ComponentProps } from "react"
import { useTranslation } from "react-i18next"

import { NotFound } from "~/components/error"
import { PublicEnv } from "~/components/utils"
import { isProduction } from "~/config/vars"
import { shopifyStorefrontAPIEndpoint } from "~/config/vars.server"
import i18next from "~/helpers/i18next.server"
import stylesheet from "~/styles/app.css"
import { ExchangeRateProvider, useChangeLanguage } from "~/utils/hooks"
import { i18nCookie } from "~/utils/i18n"
import { useCapturePageview, usePostHog } from "~/utils/posthog"

console.log("usePostHog")

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

export async function loader({ request, context }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request)
  const env = context.env

  const publicEnv: ComponentProps<typeof PublicEnv> = {
    environment: env.NODE_ENV,
    gaTrackingId: env.GA_TRACKING_ID,
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

  usePostHog(env.posthogApiKey, env.posthogHost)
  useChangeLanguage(locale)
  useCapturePageview()

  return (
    <html className="h-full" dir={i18n.dir()} lang={locale}>
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
              id="gtag-init"
            />
          </>
        )}
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
