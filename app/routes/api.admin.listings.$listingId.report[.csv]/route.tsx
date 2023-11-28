import type { LoaderFunctionArgs } from "@remix-run/node"
import { flattenConnection } from "@shopify/hydrogen-react"
import Papa from "papaparse"
import { z } from "zod"
import { zx } from "zodix"

import { PRODUCT_METAFIELDS } from "~/config/consts"
import { round } from "~/utils/number"
import { getProduct } from "~/utils/shopify.server"

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = context.db
  const { listingId } = zx.parseParams(params, { listingId: z.string() })

  const items = await db.item.findMany({
    include: { itemPurchases: true },
    where: { listingId },
  })

  const data = (
    await Promise.all(
      items.map(async (item) => {
        const numberPurchased = item.itemPurchases.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        )

        if (numberPurchased === 0) return null

        if (!item.commerceId) return null

        const product = await getProduct(item.commerceId)
        const price = Number(flattenConnection(product?.variants)[0]?.price)
        const url = flattenConnection(product?.metafields).find(
          (field) => field.key === PRODUCT_METAFIELDS.OriginalUrl,
        )?.value

        return {
          name: product?.title,
          numberPurchased,
          price: round(isNaN(price) ? 0 : price),
          total: round(numberPurchased * (isNaN(price) ? 0 : price)),
          url,
          vendor: product?.vendor,
        }
      }),
    )
  ).filter(Boolean)

  const csv = Papa.unparse(data, {
    header: true,
  })

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
    },
    status: 200,
  })
}
