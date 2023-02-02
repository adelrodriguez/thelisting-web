import { Link, Links, Meta, Scripts } from "@remix-run/react"

import { Logo } from "~/components/branding"

export default function NotFound({
  status,
  statusText,
  data,
}: {
  status: number
  statusText: string
  data: any
}) {
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
                  <p className="text-base font-semibold text-gray-600 font-body">
                    {status}
                  </p>
                  <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-header">
                    {statusText}
                  </h1>
                  <p className="mt-2 text-base text-gray-500 font-body">
                    {data}
                  </p>
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
