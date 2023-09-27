import { Outlet } from "@remix-run/react"
import { route } from "routes-gen"

import type { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle<{ listingSku: string }> = {
  crumb: ({ params }) => ({
    href: route("/dashboard/listings/:listingSku/items", {
      listingSku: params.listingSku,
    }),
    name: "Items",
  }),
  id: "dashboard-listings-listing-items",
}

export default function DashboardListingItemsPage() {
  return <Outlet />
}
