import type { RouteMatch } from "@remix-run/react"
import { NavLink, Outlet, useMatches, useNavigate } from "@remix-run/react"
import clsx from "clsx"

import { Select } from "~/components/common"

import { handle as handleIndex } from "./$sku/index"
import { handle as handleItems } from "./$sku/items"
import { handle as handleRibbons } from "./$sku/ribbons"

export const handle = {
  crumb: ({ params }: RouteMatch) => ({
    href: `/dashboard/listings/${params.sku}/`,
    name: params.sku,
  }),
}

const tabs = [
  { id: handleIndex, label: "Details", value: "./" },
  { id: handleItems.id, label: "Items", value: "./items" },
  { id: handleRibbons.id, label: "Ribbons", value: "./ribbons" },
]

export default function DashboardListingPage() {
  const navigate = useNavigate()
  const matches = useMatches()
  const currentTab = tabs.find(
    (tab) => matches[matches.length - 1]?.handle?.id === tab.id
  )!

  return (
    <>
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <Select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            defaultValue={currentTab?.value}
            onChange={(event) => navigate(event.target.value)}
            options={tabs}
          />
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.value}
                relative="route"
                className={({ isActive }) =>
                  clsx("rounded-md px-3 py-2 text-sm font-medium", {
                    "bg-gray-100 text-gray-700": isActive,
                    "text-gray-500 hover:text-gray-700": !isActive,
                  })
                }
                aria-current={tab.id === currentTab?.id ? "page" : undefined}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <Outlet />
    </>
  )
}
