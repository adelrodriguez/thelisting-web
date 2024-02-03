import { Outlet } from "@remix-run/react"

import { HOMEPAGE_URL } from "~/config/consts"
import { isProduction } from "~/config/vars"
import { temporaryRedirect } from "~/utils/http"

import Footer from "./Footer"
import Header from "./Header"

export function loader() {
  // TODO: remove this once we're live
  if (isProduction) {
    return temporaryRedirect(HOMEPAGE_URL)
  }

  return null
}

export default function MarketingLayout() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
