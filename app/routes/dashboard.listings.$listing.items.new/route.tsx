import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect , json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import { FormInput, FormSubmit } from "~/components/form"
import { isUserAdmin } from "~/utils/auth.server"
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

  const { listing: sku } = zx.parseParams(params, {
    listing: z.coerce.number(),
  })

  return json({ listingSku: sku })
}

export async function action({ request, params, context }: ActionArgs) {
  const { db } = context

  await isUserAdmin(request)
  const { listing: sku } = zx.parseParams(params, {
    listing: z.coerce.number(),
  })

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  const listing = await db.listing.findUniqueOrThrow({
    select: { id: true },
    where: { sku },
  })

  const item = await db.item.create({
    data: {
      commerceId: getShopifyId(result.data.commerceId, "Product"),
      description: result.data.description,
      listingId: listing.id,
      quantity: result.data.quantity,
      sku: sku + "-" + result.data.sku,
      stock: result.data.quantity,
    },
  })

  return redirect(`/dashboard/listings/${sku}/items/${item.sku}`)
}

export default function CreateListingsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { listingSku } = useLoaderData<typeof loader>()

  return (
    <ValidatedForm
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
      <FormInput
        description="This is a custom description for the item, provided by the client (optional)"
        label="Description"
        name="description"
      />
      <FormInput
        addOn={`${listingSku}-`}
        description="The items unique SKU"
        label="SKU"
        name="sku"
        required
      />
      <FormInput
        addOn="gid://shopify/Product/"
        description="The Shopify numeric ID for the product"
        label="Commerce ID"
        name="commerceId"
        required
      />
      <FormInput
        description="The quantity of the item"
        label="Quantity"
        name="quantity"
        required
        type="number"
      />

      <FormSubmit loadingText="Creating..." text="Create" />
    </ValidatedForm>
  )
}
