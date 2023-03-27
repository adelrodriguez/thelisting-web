import { createId } from "@paralleldrive/cuid2"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import redis from "~/helpers/cache.server"
import { commitSession, getSession } from "~/helpers/session.server"
import { getHeaders } from "~/utils/http.server"
import { generateKey } from "~/utils/redis"

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(getHeaders(request).get("cookie"))
  const url = new URL(request.url)
  const listing = url.searchParams.get("listing")
  const cartId = session.get("cartsKey")

  if (!listing) return json({ cart: null })

  if (!cartId) {
    session.set("cartsKey", createId())

    return json(
      { cart: null },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    )
  }

  return json({
    cart: await redis.get(generateKey(REDIS_KEYS.Cart, cartId, listing)),
  })
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(getHeaders(request).get("cookie"))
  const url = new URL(request.url)
  const listing = url.searchParams.get("listing")
  const text = await request.text()
  const cartId = session.get("cartsKey")

  if (!cartId) return null

  if (!listing) return null

  const response = await redis.set(
    generateKey(REDIS_KEYS.Cart, cartId, listing),
    text,
    "EX",
    ONE_DAY * 30
  )

  return json(response)
}
