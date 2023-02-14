import { Outlet } from "@remix-run/react"

export const handle = {
  crumb: () => ({ href: "/dashboard/admin/users", name: "User Management" }),
}

export default function DashboardAdminUsersPage() {
  return <Outlet />
}
