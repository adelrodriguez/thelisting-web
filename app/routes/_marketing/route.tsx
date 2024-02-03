import { Outlet } from "@remix-run/react"

import Footer from "./Footer"
import Header from "./Header"

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
