import type { RouteMatch } from "@remix-run/react"
import { Outlet } from "@remix-run/react"

export const handle = {
  crumb: ({ params }: RouteMatch) => ({
    href: `/dashboard/listings/${params.sku}/items`,
    name: "Items",
  }),
  id: "dashboard-listings-items",
}

export default function DashboardListingItemsPage() {
  return <Outlet />
}
