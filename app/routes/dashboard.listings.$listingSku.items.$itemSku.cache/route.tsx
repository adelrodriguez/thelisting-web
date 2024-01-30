import { redirect, type ActionFunctionArgs } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import { generateKey } from "~/utils/redis"

export async function action({ context, params }: ActionFunctionArgs) {
  const { itemSku } = zx.parseParams(params, z.object({ itemSku: z.string() }))

  const db = context.db
  const cache = context.cache

  const item = await db.item.findFirst({
    select: { commerceId: true },
    where: { sku: itemSku },
  })

  if (item?.commerceId) {
    await cache.del(generateKey("shopify:product", item.commerceId))
  }

  return redirect("..")
}
