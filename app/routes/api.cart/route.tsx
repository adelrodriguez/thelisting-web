import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { nanoid } from "nanoid"
import { z } from "zod"
import { zx } from "zodix"

import { ONE_WEEK } from "~/config/consts"
import { commitSession, getSession } from "~/helpers/session.server"
import { generateKey } from "~/utils/redis"

export async function loader({ context, request }: LoaderFunctionArgs) {
  const result = zx.parseQuerySafe(request, z.object({ listingId: z.string() }))

  if (!result.success) return json({ cart: null })

  const { listingId } = result.data
  const session = await getSession(request.headers.get("cookie"))
  const cartId = session.get("cartsKey")

  if (!cartId) {
    session.set("cartsKey", nanoid())

    return json(
      { cart: null },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    )
  }
  const cache = context.cache

  return json({
    cart: await cache.get(generateKey("cart", cartId, listingId)),
  })
}

export async function action({ context, request }: ActionFunctionArgs) {
  const result = zx.parseQuerySafe(request, z.object({ listingId: z.string() }))

  if (!result.success) return null

  const cache = context.cache
  const session = await getSession(request.headers.get("cookie"))
  const cartId = session.get("cartsKey")

  if (!cartId) return null

  const { listingId } = result.data

  const text = await request.text()
  const response = await cache.set(
    generateKey("cart", cartId, listingId),
    text,
    "EX",
    ONE_WEEK.inSeconds,
  )

  return json(response)
}
