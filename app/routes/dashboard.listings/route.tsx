import { Outlet } from "@remix-run/react"
import { RouteHandle } from "@remix-run/react/dist/routeModules"
import { route } from "routes-gen"

export const handle: RouteHandle = {
  crumb: () => ({ href: route("/dashboard/listings"), name: "Listings" }),
  id: "dashboard-listings",
}

export default function DashboardListingsPage() {
  return <Outlet />
}
