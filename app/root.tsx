import type { MetaFunction, LinksFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "@remix-run/react"
import remixImageStyles from "remix-image/remix-image.css"

import { xStateVisualizer } from "~/config/vars.server"
import tailwind from "~/styles/tailwind.css"

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  description: "Coming soon",
  title: "The Listing",
  viewport: "width=device-width,initial-scale=1",
})

export const links: LinksFunction = () => [
  {
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎁</text></svg>",
    rel: "icon",
  },
  { href: tailwind, rel: "stylesheet" },
  { href: remixImageStyles, rel: "stylesheet" },
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
                <div className="flex-shrink-0 pt-10 sm:pt-16">
                  <a href="/" className="inline-flex">
                    <span className="sr-only">The Listing</span>
                    <img
                      className="h-12 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                      alt=""
                    />
                  </a>
                </div>
                <div className="my-auto flex-shrink-0 py-16 sm:py-32">
                  <p className="text-base font-semibold text-indigo-600">
                    {caught.status}
                  </p>
                  <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    {caught.statusText}
                  </h1>
                  <p className="mt-2 text-base text-gray-500">{caught.data}</p>
                  <div className="mt-6">
                    <Link
                      to="/"
                      className="text-base font-medium text-indigo-600 hover:text-indigo-500"
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

export async function loader() {
  return json({
    env: {
      xStateVisualizer,
    },
  })
}

export default function App() {
  const data = useLoaderData<typeof loader>()

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white">
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(data.env)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
