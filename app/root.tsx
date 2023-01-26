import type { MetaFunction, LinksFunction, LoaderArgs } from "@remix-run/node"
import {
  Link,
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

import { Logo } from "~/components/branding"
import { PublicEnv } from "~/components/utils"
import { SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "~/config/env.server"
import {
  shopifyStorefrontAPIEndpoint,
  xStateVisualizer,
} from "~/config/vars.server"
import i18next from "~/helpers/i18next.server"
import tailwind from "~/styles/tailwind.css"
import { useChangeLanguage } from "~/utils/hooks"
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
  { href: "https://fonts.googleapis.com", rel: "preconnect" },
  {
    crossOrigin: "use-credentials",
    href: "https://fonts.gstatic.com",
    rel: "preconnect",
  },
  // {
  //   href: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap",
  //   rel: "stylesheet",
  // },
  // {
  //   href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  //   rel: "stylesheet",
  // },
]

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <html className="h-full">
      <head>
        <title>The Listing | An error ocurred</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div className="flex min-h-full flex-col bg-white lg:relative">
          <div className="flex flex-grow flex-col">
            <main className="flex flex-grow flex-col bg-white">
              <div className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 sm:px-6 lg:px-8">
                <div className="absolute pt-10 sm:pt-16">
                  <a href="/" className="inline-flex">
                    <span className="sr-only">The Listing</span>
                    <Logo />
                  </a>
                </div>
                <div className="my-auto flex-shrink-0 py-16 sm:py-32">
                  <p className="text-base font-semibold text-gray-600">
                    {caught.status}
                  </p>
                  <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    {caught.statusText}
                  </h1>
                  <p className="mt-2 text-base text-gray-500">{caught.data}</p>
                  <div className="mt-6">
                    <Link
                      to="/"
                      className="text-base font-medium text-gray-600 hover:text-gray-500"
                    >
                      Go back home
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <div className="hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-1/2">
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1470847355775-e0e3c35a9a2c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1825&q=80"
              alt=""
            />
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

export async function loader({ request }: LoaderArgs) {
  const locale = await i18next.getLocale(request)

  return json({
    env: {
      shopifyStorefrontAPIEndpoint,
      shopifyStorefrontAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      xStateVisualizer,
    },
    locale,
  })
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
      <body className="h-full bg-white">
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
