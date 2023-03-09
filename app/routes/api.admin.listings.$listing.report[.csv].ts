import type { LoaderArgs } from "@remix-run/node"
import { flattenConnection } from "@shopify/storefront-kit-react"
import Papa from "papaparse"

import { PRODUCT_METAFIELDS } from "~/config/consts"
import prisma from "~/helpers/prisma.server"
import { getParam } from "~/utils/remix"
import { getProduct } from "~/utils/shopify.server"

export async function loader({ params }: LoaderArgs) {
  const listing = getParam(params, "listing")

  const items = await prisma.item.findMany({
    include: {
      itemPurchases: true,
    },

    where: {
      listingId: listing,
    },
  })

  const data = (
    await Promise.all(
      items.map(async (item) => {
        const numberPurchased = item.itemPurchases.reduce(
          (acc, curr) => acc + curr.quantity,
          0
        )

        if (numberPurchased === 0) return null

        if (!item.commerceId) return null

        const product = await getProduct(item.commerceId)
        const price = flattenConnection(product?.metafields).find(
          (field) => field.key === PRODUCT_METAFIELDS.OriginalPrice
        )?.value
        const url = flattenConnection(product?.metafields).find(
          (field) => field.key === PRODUCT_METAFIELDS.OriginalUrl
        )?.value

        return {
          name: product?.title,
          numberPurchased,
          price: Number(price).toFixed(2),
          total: (numberPurchased * (Number(price) || 0)).toFixed(2),
          url,
          vendor: product?.vendor,
        }
      })
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
