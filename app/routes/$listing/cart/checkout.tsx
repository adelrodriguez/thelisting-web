import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useCatch, useNavigate } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import { z } from "zod"

import { Alert } from "~/components/common"
import { MARKUP_FEE, PAYMENT_FEE } from "~/config/consts"
import { calculateSubtotal, cartItemsSchema } from "~/utils/cart"
import { calculateFees, checkAvailability } from "~/utils/checkout.server"
import { getFormData } from "~/utils/http.server"
import { goToParent } from "~/utils/remix"
import { createCheckout } from "~/utils/shopify.server"

export function loader() {
  return goToParent()
}

const checkoutDataSchema = z.object({
  cartItems: z
    .string()
    .transform((items) => JSON.parse(items))
    .transform(cartItemsSchema.parse),
  listingId: z.string(),
  note: z.string(),
  sku: z.string(),
})

export async function action({ request }: ActionArgs): Promise<Response> {
  try {
    const formData = await getFormData(request)
    const data = Object.fromEntries(formData.entries())
    const { cartItems, sku, note, listingId } = checkoutDataSchema.parse(data)

    // Check that all items are available
    const hasAvailability = await Promise.all(cartItems.map(checkAvailability))

    if (hasAvailability.some((available) => !available)) {
      throw json("Some items are no longer available.")
    }

    const subtotal = calculateSubtotal(cartItems)
    const { paymentFee, markupFee } = calculateFees(
      subtotal,
      MARKUP_FEE,
      PAYMENT_FEE
    )
    const shippingFee = paymentFee + markupFee

    const checkout = await createCheckout(cartItems, shippingFee, note, {
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
