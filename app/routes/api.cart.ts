import { createId } from "@paralleldrive/cuid2"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import { commitSession, getSession } from "~/helpers/session.server"
import { generateKey } from "~/utils/redis"

export async function loader({ request, context }: LoaderArgs) {
  const cache = context.cache
  const session = await getSession(request.headers.get("cookie"))
  const url = new URL(request.url)
  const listing = url.searchParams.get("listing")
  const cartId = session.get("cartsKey")

  if (!listing) return json({ cart: null })

  if (!cartId) {
    session.set("cartsKey", createId())

    return json(
      { cart: null },
      {
        // TODO(adelrodriguez): Set the expiration date to be the same as the
        // previous one
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    )
  }

  return json({
    cart: await cache.get(generateKey(REDIS_KEYS.Cart, cartId, listing)),
  })
}

export async function action({ request, context }: ActionArgs) {
  const cache = context.cache
  const session = await getSession(request.headers.get("cookie"))
  const url = new URL(request.url)
  const listing = url.searchParams.get("listing")
  const text = await request.text()
  const cartId = session.get("cartsKey")

  if (!cartId) return null

  if (!listing) return null

  const response = await cache.set(
    generateKey(REDIS_KEYS.Cart, cartId, listing),
    text,
    "EX",
    ONE_DAY * 30
  )

  return json(response)
}
