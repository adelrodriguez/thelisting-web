import { EllipsisVerticalIcon, TvIcon } from "@heroicons/react/20/solid"
import { RibbonType } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import clsx from "clsx"
import { notFound } from "remix-utils"
import { setFormDefaults } from "remix-validated-form"

import db from "~/helpers/db.server"
import type { ErrorBoundaryProps } from "~/utils/remix"
import { getParam } from "~/utils/remix"
import { json } from "~/utils/remix"

export const handle = {
  id: "dashboard-listings-ribbons",
}

export async function loader({ params }: LoaderArgs) {
  const sku = getParam(params, "listing")

  if (isNaN(Number(sku))) throw notFound("Listing not found")

  const ribbons = await db.ribbon.findMany({
    where: { listing: { sku: Number(sku) } },
  })

  return json({
    ribbons,
    ...ribbons.reduce((acc, curr) => {
      return { ...acc, ...setFormDefaults(curr.id, curr) }
    }, {}),
  })
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return <div>There was an error. Error: {error.message}</div>
}

const ribbons = [
  {
    color: "bg-red-500",
    description: "Large ribbon with image",
    icon: TvIcon,
    name: RibbonType.Banner,
  },
]

export default function DashboardListingRibbonsPage() {
  return (
    <div className="h-screen pt-5">
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3 md:gap-8">
        <div className="grid grid-cols-1 gap-4">
          <section>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-gray-700">
                  Ribbon Types
                </h2>
              </div>
              <div className="p-6">
                <ul>
                  {ribbons.map((ribbon) => (
                    <li
                      key={ribbon.name}
                      className="col-span-1 flex rounded-md shadow-sm"
                    >
                      <div
                        className={clsx(
                          ribbon.color,
                          "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white"
                        )}
                      >
                        <ribbon.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                        <div className="flex-1 truncate px-4 py-2 text-sm">
                          <h3 className="font-medium text-gray-900 hover:text-gray-600">
                            {ribbon.name}
                          </h3>
                          <p className="text-gray-500">{ribbon.description}</p>
                        </div>
                        <div className="flex flex-shrink-0 pr-2 hover:cursor-grab">
                          <EllipsisVerticalIcon
                            className="-mr-3 h-5 w-auto"
                            aria-hidden="true"
                          />
                          <EllipsisVerticalIcon
                            className="h-5 w-auto"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 md:col-span-2">
          <section aria-labelledby="section-1-title">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
              <h2 className="text-base font-semibold leading-6 text-gray-700">
                Page
              </h2>
            </div>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">{/* Your content */}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
