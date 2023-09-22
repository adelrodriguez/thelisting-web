import { Outlet } from "@remix-run/react"

import type { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle<{ listing: string }> = {
  crumb: ({ params }) => ({
    href: `/dashboard/listings/${params.listing}/items`,
    name: "Items",
  }),
  id: "dashboard-listings-items",
}

export default function DashboardListingItemsPage() {
  return <Outlet />
}
