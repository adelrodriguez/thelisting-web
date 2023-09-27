import { Outlet } from "@remix-run/react"
import { route } from "routes-gen"

import { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle = {
  crumb: () => ({
    href: route("/dashboard/admin"),
    name: "Admin Tools",
  }),
  id: "dashboard-admin",
}

export default function DashboardListingsPage() {
  return <Outlet />
}
