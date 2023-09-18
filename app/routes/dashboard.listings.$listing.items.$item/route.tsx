import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { RouteMatch } from "@remix-run/react"
import { useLoaderData , Outlet , Link } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { notFound } from "remix-utils"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import { ViewOnShopify } from "~/components/admin"
import { Image } from "~/components/common"
import type { NotFoundBoundaryData } from "~/components/error"
import { FormInput, SubmitButton, TextArea } from "~/components/form"
import { useProduct } from "~/utils/hooks"
import { formatPrice } from "~/utils/money"

export const handle = {
  crumb: ({ params }: RouteMatch) => ({
    href: `/dashboard/listings/${params.listing}/items/${params.item}`,
    name: params.item,
  }),
}

const EditItemSchema = z
  .object({
    description: z.string().optional(),
    quantity: z.coerce.number().min(0),
    stock: z.coerce.number().min(0),
  })
  .refine((data) => data.quantity >= data.stock, {
    message: "Stock cannot be greater than quantity",
    path: ["stock"],
  })

const validator = withZod(EditItemSchema)

export async function loader({ params, context }: LoaderArgs) {
  const { db } = context
  const { item: sku } = zx.parseParams(params, {
    item: z.string(),
  })

  const item = await db.item.findUnique({ where: { sku } })

  if (!item) {
    throw notFound<NotFoundBoundaryData>({
      message: "The item you are looking for does not exist.",
      title: "Item not found",
    })
  }

  const itemPurchases = await db.itemPurchase.findMany({
    where: { itemId: item.id },
  })

  const itemPurchaseCount = itemPurchases.length

  return json({
    item,
    itemPurchaseCount,
    stats: [
      { name: "Total Times Ordered", stat: itemPurchaseCount },
      {
        name: "Total Purchased",
        stat: itemPurchases.reduce((acc, cur) => acc + cur.quantity, 0),
      },
    ],
    ...setFormDefaults("edit-item", item),
  })
}

export async function action({ request, params, context }: ActionArgs) {
  const { db } = context
  const formData = await request.formData()
  const result = await validator.validate(formData)
  const { item: sku } = zx.parseParams(params, {
    item: z.string(),
  })

  if (result.error) return validationError(result.error)

  const item = await db.item.update({
    data: result.data,
    where: { sku },
  })

  return { item }
}

export default function DashboardListingItemDetailPage() {
  const { item, stats, itemPurchaseCount } = useLoaderData<typeof loader>()
  const { data, isLoading, isError } = useProduct(item.commerceId!)
  const { enqueueSnackbar } = useSnackbar()

  return (
    <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Product Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This is the product information available on Shopify.
            </p>
            {!isLoading && !isError ? (
              <div className="mt-4 flex flex-col md:flex-row">
                <div className="mr-4 flex-shrink-0">
                  <Image
                    src={data.imageUrl}
                    alt={data.title}
                    className="h-full w-64 rounded-sm"
                  />
                </div>
                <div className="mt-2 md:mt-0">
                  <h4 className="text-lg font-bold">{data.title}</h4>
                  <p className="mt-1">
                    {formatPrice(data.price, data.currencyCode)}
                  </p>
                </div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            {item.commerceId && <ViewOnShopify id={item.commerceId} />}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Purchases
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.name}
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
              >
                <dt className="truncate text-sm font-medium text-gray-500">
                  {item.name}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {item.stat}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="w-full max-w-xl pt-8 sm:pt-0">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Item Information
        </h3>
        <ValidatedForm
          validator={validator}
          id="edit-item"
          method="POST"
          className="flex flex-col gap-y-6 pt-4"
          onSubmit={() => {
            enqueueSnackbar("Item updated 🎉", {
              description: "The item was successfully updated",
              variant: "success",
            })
          }}
        >
          <TextArea
            label="Description"
            name="description"
            description="Custom description that the client wants to show on the product"
          />
          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            step="1"
            min={0}
          />
          <FormInput
            label="Stock"
            name="stock"
            type="number"
            step="1"
            min={0}
          />
          <div className="flex justify-end">
            {itemPurchaseCount === 0 && (
              <Link to="delete">
                <button
                  type="button"
                  className="mr-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm  ring-0 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  disabled={itemPurchaseCount > 0}
                >
                  Delete
                </button>
              </Link>
            )}
            <SubmitButton loadingText="Updating...">Update</SubmitButton>
          </div>
        </ValidatedForm>
      </div>
      <Outlet />
    </div>
  )
}
