import type { ActionArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "@remix-run/react"
import { z } from "zod"

import { Alert } from "~/components/common"
import { getSession } from "~/helpers/session.server"
import { CartItemsSchema } from "~/utils/cart"
import { checkStock } from "~/utils/checkout.server"
import { createCheckout } from "~/utils/shopify.server"

export function loader() {
  return redirect("..")
}

const CheckoutDataSchema = z.object({
  cartItems: z
    .string()
    .transform((items) => JSON.parse(items))
    .transform(CartItemsSchema.parse),
  listingId: z.string(),
  noteId: z.string().optional(),
  sku: z.string(),
})

export async function action({
  request,
  context,
}: ActionArgs): Promise<Response> {
  const { db, logger } = context
  try {
    const headers = request.headers
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())
    const session = await getSession(headers.get("cookie"))
    const { cartItems, sku, listingId, noteId } = CheckoutDataSchema.parse(data)

    // Check that all items are available, in case someone messed with the cart
    const hasStock = await Promise.all(
      cartItems.map((item) => checkStock(db, item))
    )
    const cartsKey = session.get("cartsKey")

    const listing = await db.listing.findUnique({ where: { id: listingId } })

    if (!listing || listing.isInternal) {
      throw new Error("Listing not available for purchase.")
    }

    if (!cartsKey) {
      throw new Error("No cartsKey found.")
    }

    if (hasStock.some((isAvailable) => !isAvailable)) {
      return json("Some items are no longer available.", { status: 400 })
    }

    const checkout = await createCheckout(cartItems, {
      listingId,
      noteId,
      sessionCartsKey: cartsKey,
      sku,
    })

    return redirect(checkout.url)
  } catch (error) {
    logger.error(error)
    throw json("There was an error creating your order.", { status: 500 })
  }
}

export function ErrorBoundary() {
  const navigate = useNavigate()
  const error = useRouteError()

  if (!isRouteErrorResponse(error)) {
    // TODO(adelrodriguez): Report this error to Sentry

    return null
  }

  return (
    <div className="mb-2 mt-4">
      <Alert onClose={() => navigate("../")} type="error">
        {error.data}
      </Alert>
    </div>
  )
}
