import { Outlet } from "@remix-run/react"

import { LayoutHeader, LayoutFooter } from "~/components/marketing"

export default function MarketingLayout() {
  return (
    <>
      <LayoutHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <LayoutFooter />
    </>
  )
}
