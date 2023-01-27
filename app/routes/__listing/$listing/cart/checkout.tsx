import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useCatch, useNavigate } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import { Alert } from "~/components/common"
import { CartItemsSchema } from "~/utils/cart"
import { checkAvailability } from "~/utils/checkout.server"
import { getFormData } from "~/utils/http.server"
import { goToParent } from "~/utils/remix"
import { createCheckout } from "~/utils/shopify.server"

export function loader() {
  return goToParent()
}

const CheckoutDataSchema = z.object({
  cartItems: z
    .string()
    .transform((items) => JSON.parse(items))
    .transform(CartItemsSchema.parse),
  listingId: z.string(),
  sku: z.string(),
})

export async function action({ request }: ActionArgs): Promise<Response> {
  try {
    const formData = await getFormData(request)
    const data = Object.fromEntries(formData.entries())
    const { cartItems, sku, listingId } = CheckoutDataSchema.parse(data)

    // Check that all items are available, in case someone messed with the cart
    const hasAvailability = await Promise.all(cartItems.map(checkAvailability))

    if (hasAvailability.some((available) => !available)) {
      throw json("Some items are no longer available.")
    }

    const checkout = await createCheckout(cartItems, {
      listingId,
      sku,
    })

    return redirect(checkout.url)
  } catch (error) {
    Sentry.captureException(error)
    throw json("There was an error creating your order.")
  }
}

export function CatchBoundary() {
  const navigate = useNavigate()
  const error = useCatch()

  return (
    <div className="mt-4 mb-2">
      <Alert onClose={() => navigate("../")} type="error">
        {error.data}
      </Alert>
    </div>
  )
}
