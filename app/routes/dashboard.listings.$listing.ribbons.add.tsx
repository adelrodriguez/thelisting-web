import { RibbonType } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { redirect } from "react-router"

import db from "~/helpers/db.server"
import { getParam } from "~/utils/remix"

export async function action({ params, context }: ActionArgs) {
  const logger = context.logger
  const sku = getParam(params, "listing")

  const listing = await db.listing.findUniqueOrThrow({
    where: { sku: Number(sku) },
  })

  const ribbons = await db.ribbon.count({
    where: { listingId: listing.id },
  })

  const ribbon = await db.ribbon.create({
    data: {
      listingId: listing.id,
      name: `New Ribbon ${ribbons}`,
      position: ribbons,
      properties: {
        title: "New Ribbon",
      },
      type: RibbonType.Banner,
    },
  })

  logger.info("Created new ribbon", { ribbon })

  return redirect(`/dashboard/listings/${sku}/ribbons`)
}

export default function DashboardListingRibbonsAddPage() {
  return (
    <form method="post">
      <button type="submit">Add</button>
    </form>
  )
}
