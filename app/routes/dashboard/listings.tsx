import { Outlet } from "@remix-run/react"

export const handle = {
  crumb: () => ({ href: "/dashboard/listings/", name: "Listings" }),
}

export default function DashboardListingsPage() {
  return <Outlet />
}
