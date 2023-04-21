import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"

import { FormInput, FormSubmit } from "~/components/form"
import { isUserAdmin } from "~/utils/auth.server"
import { getParam, json, redirect, useLoaderData } from "~/utils/remix"
import { getShopifyId } from "~/utils/shopify"

export const handle = {
  crumb: () => ({
    href: `/dashboard/listings/new/`,
    name: "New Listing",
  }),
}

const CreateItemSchema = z.object({
  commerceId: z.string(),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1),
  sku: z.string(),
})

const validator = withZod(CreateItemSchema)

export async function loader({ request, params }: LoaderArgs) {
  await isUserAdmin(request)

  const sku = getParam(params, "listing")

  return json({
    listingSku: sku,
  })
}

export async function action({ request, params, context }: ActionArgs) {
  const { db } = context

  await isUserAdmin(request)
  const listingSku = getParam(params, "listing")

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  const listing = await db.listing.findUniqueOrThrow({
    select: { id: true },
    where: { sku: Number(listingSku) },
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

  return redirect(`/dashboard/listings/${listingSku}/items/${item.sku}`)
}

export default function CreateListingsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { listingSku } = useLoaderData<typeof loader>()

  return (
    <ValidatedForm
      id="createItem"
      validator={validator}
      method="POST"
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
      resetAfterSubmit
      onSubmit={() => {
        enqueueSnackbar("Item created 🎉", {
          description: "The item was successfully created.",
          variant: "success",
        })
      }}
      defaultValues={{
        quantity: 1,
      }}
    >
      <FormInput
        label="Description"
        name="description"
        description="This is a custom description for the item, provided by the client (optional)"
      />
      <FormInput
        name="sku"
        label="SKU"
        addOn={`${listingSku}-`}
        description="The items unique SKU"
        required
      />
      <FormInput
        label="Commerce ID"
        name="commerceId"
        addOn="gid://shopify/Product/"
        description="The Shopify numeric ID for the product"
        required
      />
      <FormInput
        label="Quantity"
        name="quantity"
        type="number"
        description="The quantity of the item"
        required
      />

      <FormSubmit text="Create" loadingText="Creating..." />
    </ValidatedForm>
  )
}
