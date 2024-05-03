import { json, redirect } from "@remix-run/node"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { isRouteErrorResponse, useNavigate, useRouteError } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { Alert } from "~/components/common"
import { getSession } from "~/helpers/session.server"
import posthog, { getDistinctId } from "~/services/posthog.server"
import Sentry from "~/services/sentry"
import { CartItemsSchema } from "~/utils/cart"
import { checkStock } from "~/utils/checkout.server"
import { badRequest, internalServerError, notFound } from "~/utils/http"
import { createCheckout } from "~/utils/shopify.server"

export function loader({ params }: LoaderFunctionArgs) {
  const { listingPath } = zx.parseParams(params, z.object({ listingPath: z.string() }))

  return redirect(
    route("/:listingPath/registry/cart", {
      listingPath,
    }),
  )
}

const validator = withZod(
  z.object({
    cartItems: z
      .string()
      .transform((items) => JSON.parse(items))
      .transform(CartItemsSchema.parse),

    listingId: z.string(),

    noteId: z.string().optional(),

    sku: z.string(),
  }),
)

export async function action({ context, request }: ActionFunctionArgs): Promise<Response> {
  const db = context.db
  const logger = context.logger

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) {
    Sentry.captureMessage("Error validating checkout payload", {
      extra: { data: result.submittedData, errors: result.error.fieldErrors },
    })

    throw badRequest({
      message: "There was an error preparing your checkout. Please reload the page and try again.",
      title: "Oops!",
    })
  }

  const { cartItems, listingId, noteId, sku } = result.data

  // Check that all items are available, in case someone messed with the cart
  const hasStock = await Promise.all(cartItems.map((item) => checkStock(db, item)))

  if (hasStock.some((isAvailable) => !isAvailable)) {
    throw json({
      message: "Some items are no longer available.",
      title: "We're sorry!",
    })
  }

  const headers = request.headers
  const session = await getSession(headers.get("cookie"))
  const cartsKey = session.get("cartsKey")

  if (!cartsKey) {
    throw badRequest({
      message: "There was an error preparing your checkout. Please contact support.",
      title: "Oops!",
    })
  }

  const listing = await db.listing.findUnique({ where: { id: listingId } })

  if (!listing) {
    throw notFound({ message: "This listing is no longer available." })
  }

  if (listing.isInternal) {
    throw json({
      message: "This listing is not available for purchase.",
      title: "Oops!",
    })
  }

  try {
    const checkout = await createCheckout(cartItems, {
      listingId,
      noteId,
      sessionCartsKey: cartsKey,
      sku,
    })

    const distinctId = getDistinctId(headers)

    posthog.capture({
      distinctId,
      event: "checkout_started",
      properties: {
        checkoutId: checkout.id,
        sku,
      },
    })

    return redirect(checkout.url)
  } catch (error) {
    Sentry.captureException(error)
    logger.error(error)

    throw internalServerError({
      message: "There was an error creating your order. Please try again later.",
      title: "We're sorry",
    })
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
    <Alert
      // TODO(adelrodriguez): Replace with route
      onClose={() => navigate("../")}
      title={error.data.title}
      type={error.status === 200 ? "warning" : "error"}
    >
      {error.data.message}
    </Alert>
  )
}
