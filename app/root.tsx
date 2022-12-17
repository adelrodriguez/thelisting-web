import type { MetaFunction, LinksFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"

import tailwind from "~/styles/tailwind.css"

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "The Listing",
  viewport: "width=device-width,initial-scale=1",
})

export const links: LinksFunction = () => [
  {
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎁</text></svg>",
    rel: "icon",
  },
  { href: tailwind, rel: "stylesheet" },
]

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1 className="text-3xl">There was an error</h1>
        <p>
          {caught.status} {caught.statusText}
        </p>
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
