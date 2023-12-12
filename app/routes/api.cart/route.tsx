import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { nanoid } from "nanoid"
import { z } from "zod"
import { zx } from "zodix"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import { commitSession, getSession } from "~/helpers/session.server"
import { generateKey } from "~/utils/redis"

export async function loader({ request, context }: LoaderFunctionArgs) {
  const result = zx.parseQuerySafe(request, z.object({ listingId: z.string() }))

  if (!result.success) return json({ cart: null })

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
    cart: await cache.get(
      generateKey(REDIS_KEYS.Cart, cartId, result.data.listingId),
    ),
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
  const result = zx.parseQuerySafe(request, z.object({ listingId: z.string() }))

  if (!result.success) return null

  const cache = context.cache
  const session = await getSession(request.headers.get("cookie"))
  const cartId = session.get("cartsKey")

  if (!cartId) return null

  const text = await request.text()
  const response = await cache.set(
    generateKey(REDIS_KEYS.Cart, cartId, result.data.listingId),
    text,
    "EX",
    ONE_DAY.inSeconds * 30,
  )

  return json(response)
}
