import { Outlet } from "@remix-run/react"
import { route } from "routes-gen"

import { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle = {
  crumb: () => ({
    href: route("/dashboard/admin/users"),
    name: "User Management",
  }),
  id: "dashboard-admin-users",
}

export default function DashboardAdminUsersPage() {
  return <Outlet />
}
