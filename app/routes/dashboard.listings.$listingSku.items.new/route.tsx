import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useParams } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { validationError } from "remix-validated-form"
import { RouteParams, route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { Form, Input, InputWithAddOn, SubmitButton } from "~/components/form"
import { isUserAdmin } from "~/utils/auth.server"
import type { RouteHandle } from "~/utils/remix"
import { getShopifyId } from "~/utils/shopify"

export const handle: RouteHandle<{ listingSku: string }> = {
  crumb: ({ params }) => ({
    href: route("/dashboard/listings/:listingSku/items/new", {
      listingSku: params.listingSku,
    }),
    name: "New Listing",
  }),
  id: "dashboard-listings-listing-items-new",
}

const CreateItemSchema = z.object({
  commerceId: z.string(),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1),
  sku: z.string(),
})

const validator = withZod(CreateItemSchema)

export async function action({ context, params, request }: ActionFunctionArgs) {
  const { db } = context

  await isUserAdmin(request)
  const { listingSku } = zx.parseParams(params, {
    listingSku: z.coerce.number(),
  })

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  const listing = await db.listing.findUniqueOrThrow({
    select: { id: true },
    where: { sku: listingSku },
  })

  const item = await db.item.create({
    data: {
      commerceId: getShopifyId(result.data.commerceId, "Product"),
      description: result.data.description,
      listingId: listing.id,
      quantity: result.data.quantity,
      sku: listingSku + "-" + result.data.sku,
      stock: result.data.quantity,
    },
  })

  return redirect(
    route("/dashboard/listings/:listingSku/items/:itemSku", {
      itemSku: item.sku,
      listingSku: `${listingSku}`,
    }),
  )
}

export default function CreateListingsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { listingSku } =
    useParams<RouteParams["/dashboard/listings/:listingSku/items/new"]>()

  return (
    <Form
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
      defaultValues={{
        quantity: 1,
      }}
      id="createItem"
      method="POST"
      onSubmit={() => {
        enqueueSnackbar("Item created 🎉", {
          description: "The item was successfully created.",
          variant: "success",
        })
      }}
      resetAfterSubmit
      validator={validator}
    >
      <Input
        description="This is a custom description for the item, provided by the client (optional)"
        label="Description"
        name="description"
      />
      <InputWithAddOn
        addOn={`${listingSku}-`}
        description="The items unique SKU"
        label="SKU"
        name="sku"
        required
      />
      <InputWithAddOn
        addOn="gid://shopify/Product/"
        description="The Shopify numeric ID for the product"
        label="Commerce ID"
        name="commerceId"
        required
      />
      <Input
        description="The quantity of the item"
        label="Quantity"
        name="quantity"
        required
        type="number"
      />

      <SubmitButton loadingText="Creating...">Create</SubmitButton>
    </Form>
  )
}
