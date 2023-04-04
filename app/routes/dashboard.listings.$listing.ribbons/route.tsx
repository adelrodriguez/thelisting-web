import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import SuperJSON from "superjson"

import db from "~/helpers/db.server"
import type { ErrorBoundaryProps } from "~/utils/remix"
import { useFetcher } from "~/utils/remix"
import { useLoaderData } from "~/utils/remix"
import { getParam } from "~/utils/remix"
import { json } from "~/utils/remix"

import type { RibbonOrder } from "./PageRibbons"
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

export async function action({ params, context, request }: ActionArgs) {
  const logger = context.logger
  const formData = await request.clone().formData()

  // TODO(adelrodriguez): Fix this type
  const orderedRibbonsData = formData.get("orderedRibbons") as string
  const orderedRibbons = SuperJSON.parse<RibbonOrder[]>(orderedRibbonsData)

  for (const order of orderedRibbons) {
    await db.ribbon.update({
      data: { position: order.new },
      where: { id: order.ribbonId },
    })

    logger.info(
      `Updated ribbon ${order.ribbonId} moved position: ${order.previous} → ${order.new}`
    )
  }

  return null
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return <div>There was an error. Error: {error.message}</div>
}

export default function DashboardListingRibbonsPage() {
  const { ribbons } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  async function submitOrder(orderedRibbons: RibbonOrder[]) {
    await fetcher.submit(
      { orderedRibbons: SuperJSON.stringify(orderedRibbons) },
      { method: "post" }
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3 md:gap-8">
        <div className="grid grid-cols-1 gap-4 md:col-span-2">
          <section aria-labelledby="section-1-title">
            <div className=" rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-gray-700">
                  Page
                </h2>
              </div>
              <div className="p-6">
                <PageRibbons ribbons={ribbons} onMove={submitOrder} />
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
