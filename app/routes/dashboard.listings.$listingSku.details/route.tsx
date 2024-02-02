import { Outlet } from "@remix-run/react"
import { route } from "routes-gen"

import type { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle<{ listingSku: string }> = {
  crumb: ({ params }) => ({
    href: route("/dashboard/listings/:listingSku/details", {
      listingSku: params.listingSku,
    }),
    name: "Details",
  }),
  id: "dashboard-listings-listing",
}

export default function Page() {
  return <Outlet />
}
