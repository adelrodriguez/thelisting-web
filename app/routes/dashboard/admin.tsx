import { Outlet } from "@remix-run/react"

export const handle = {
  crumb: () => ({
    href: "/dashboard/admin/",
    name: "Admin Tools",
  }),
}

export default function DashboardListingsPage() {
  return <Outlet />
}
