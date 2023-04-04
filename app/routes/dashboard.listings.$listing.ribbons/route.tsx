import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { Link, Outlet } from "@remix-run/react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { z } from "zod"

import { Button } from "~/components/common"
import db from "~/helpers/db.server"
import type { ErrorBoundaryProps } from "~/utils/remix"
import { useFetcher } from "~/utils/remix"
import { useLoaderData } from "~/utils/remix"
import { getParam } from "~/utils/remix"
import { json } from "~/utils/remix"

import PageRibbons from "./PageRibbons"

export const handle = {
  id: "dashboard-listings-ribbons",
}

export async function loader({ params }: LoaderArgs) {
  const sku = getParam(params, "listing")

  const ribbons = await db.ribbon.findMany({
    orderBy: { position: "asc" },
    where: { listing: { sku: Number(sku) } },
  })

  return json({ ribbons })
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()

  const jsonData = z.string().parse(formData.get("ribbonIds"))
  const unparsedIds = JSON.parse(jsonData)
  const ribbonIds = z.array(z.string()).parse(unparsedIds)

  for (const [index, id] of ribbonIds.entries()) {
    await db.ribbon.update({
      data: { position: index },
      where: { id },
    })
  }

  return null
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return <div className="pt-2">There was an error. Error: {error.message}</div>
}

export default function DashboardListingRibbonsPage() {
  const { ribbons } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  async function submitOrder(ribbonIds: string[]) {
    await fetcher.submit(
      { ribbonIds: JSON.stringify(ribbonIds) },
      { method: "post" }
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mt-4 grid grid-cols-1 items-start gap-4 md:grid-cols-3 md:gap-8">
        <div className="grid grid-cols-1 gap-4 md:col-span-2">
          <section aria-labelledby="section-1-title">
            <div className=" rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-gray-700">
                  Page
                </h2>
              </div>
              <div className="px-6 py-2">
                {ribbons.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <p className="text-sm text-gray-500">
                      No ribbons have been added to this page yet.
                    </p>
                    <Link to="add" relative="route" preventScrollReset>
                      <Button>Add a ribbon</Button>
                    </Link>
                  </div>
                ) : (
                  <PageRibbons ribbons={ribbons} onMove={submitOrder} />
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <section>
            <div className=" rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-gray-700">
                  Preview
                </h2>
              </div>
              <div className="p-6">Preview goes here</div>
            </div>
          </section>
        </div>
      </div>
      <Outlet />
    </DndProvider>
  )
}
