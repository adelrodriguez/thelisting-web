import type { UIMatch } from "@remix-run/react"
import { NavLink, Outlet, useMatches, useNavigate } from "@remix-run/react"
import clsx from "clsx"

import { Select } from "~/components/common"
import { handle as indexHandle } from "~/routes/dashboard.listings.$listing._index/route"
import { handle as itemsHandle } from "~/routes/dashboard.listings.$listing.items/route"
import { handle as ribbonsHandle } from "~/routes/dashboard.listings.$listing.ribbons/route"
import { handle as statsHandle } from "~/routes/dashboard.listings.$listing.stats/route"
import type { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle<{ listing: string }> = {
  crumb: ({ params }) => ({
    href: `/dashboard/listings/${params.listing}/`,
    name: params.listing,
  }),
  id: "dashboard-listings-listing",
}

const tabs = [
  { id: indexHandle, label: "Details", value: "./" },
  { id: statsHandle.id, label: "Stats", value: "./stats" },
  { id: itemsHandle.id, label: "Items", value: "./items" },
  { id: ribbonsHandle.id, label: "Ribbons", value: "./ribbons" },
]

export default function DashboardListingPage() {
  const navigate = useNavigate()
  const matches = useMatches() as UIMatch<unknown, RouteHandle | undefined>[]
  const currentTab = tabs.find(
    (tab) => matches[matches.length - 1]?.handle?.id === tab.id
  )

  return (
    <>
      <div className="sm:hidden">
        <label className="sr-only" htmlFor="tabs">
          Select a tab
        </label>
        <Select
          className="block w-full rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500"
          defaultValue={currentTab?.value}
          id="tabs"
          name="tabs"
          onChange={(event) => navigate(event.target.value)}
          options={tabs}
        />
      </div>
      <div className="hidden sm:block">
        <nav aria-label="Tabs" className="flex space-x-4">
          {tabs.map((tab) => (
            <NavLink
              aria-current={tab.id === currentTab?.id ? "page" : undefined}
              className={({ isActive }) =>
                clsx("rounded-md px-3 py-2 text-sm font-medium", {
                  "bg-gray-200 text-gray-800": isActive,
                  "text-gray-500 hover:text-gray-800": !isActive,
                })
              }
              key={tab.label}
              relative="route"
              to={tab.value}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </>
  )
}
