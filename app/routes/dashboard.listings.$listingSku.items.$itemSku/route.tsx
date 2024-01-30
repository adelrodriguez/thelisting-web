import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, Outlet, Link, Form } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import {
  ValidatedForm,
  setFormDefaults,
  validationError,
} from "remix-validated-form"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { ViewOnShopify } from "~/components/admin"
import { Button } from "~/components/common"
import { Input, SubmitButton, TextArea } from "~/components/form"
import { useExchangeRate } from "~/utils/hooks"
import { notFound } from "~/utils/http"
import { getItemWithData } from "~/utils/item"
import { formatPrice } from "~/utils/money"
import type { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle<{ listingSku: string; itemSku: string }> = {
  crumb: ({ params }) => ({
    href: route("/dashboard/listings/:listingSku/items/:itemSku", {
      itemSku: params.itemSku,
      listingSku: params.listingSku,
    }),
    name: params.itemSku,
  }),
  id: "dashboard-listings-listing-items-item",
}

const validator = withZod(
  z
    .object({
      description: z.string().optional(),
      quantity: z.coerce.number().min(0),
      stock: z.coerce.number().min(0),
    })
    .refine((data) => data.quantity >= data.stock, {
      message: "Stock cannot be greater than quantity",
      path: ["stock"],
    }),
)

export async function loader({ context, params }: LoaderFunctionArgs) {
  const db = context.db
  const cache = context.cache

  const { itemSku } = zx.parseParams(params, {
    itemSku: z.string(),
  })

  const item = await db.item.findUnique({ where: { sku: itemSku } })

  if (!item) {
    throw notFound({
      message: "The item you are looking for does not exist.",
      title: "Item not found",
    })
  }

  const itemWithData = await getItemWithData(cache, item)

  if (!itemWithData) {
    throw notFound({
      message: "The item you are looking for does not exist.",
      title: "Item not found",
    })
  }

  const itemPurchases = await db.itemPurchase.findMany({
    where: { itemId: item.id },
  })

  const itemPurchaseCount = itemPurchases.length

  return json({
    item: itemWithData,
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

export async function action({ context, params, request }: ActionFunctionArgs) {
  const { db } = context
  const { itemSku } = zx.parseParams(params, {
    itemSku: z.string(),
  })

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  const item = await db.item.update({
    data: result.data,
    where: { sku: itemSku },
  })

  return { item }
}

export default function DashboardListingItemDetailPage() {
  const { item, itemPurchaseCount, stats } = useLoaderData<typeof loader>()
  const { enqueueSnackbar } = useSnackbar()
  const { currency } = useExchangeRate()

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
            <div className="mt-4 flex flex-col md:flex-row">
              <div className="mr-4 flex-shrink-0">
                <img
                  alt={item.data.title}
                  className="h-full w-64 rounded-sm"
                  src={item.data.imageUrl}
                />
              </div>
              <div className="mt-2 md:mt-0">
                <h4 className="text-lg font-bold">{item.data.title}</h4>
                <p className="mt-1">{formatPrice(item.data.price, currency)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 px-4 py-4 sm:px-6">
            {item.commerceId && <ViewOnShopify gid={item.commerceId} />}
            <Form action="cache" method="POST">
              <Button type="submit" variant="secondary">
                Clear Cache
              </Button>
            </Form>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Purchases
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
                key={s.name}
              >
                <dt className="truncate text-sm font-medium text-gray-500">
                  {s.name}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {s.stat}
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
          className="flex flex-col gap-y-6 pt-4"
          id="edit-item"
          method="POST"
          onSubmit={() => {
            enqueueSnackbar("Item updated 🎉", {
              description: "The item was successfully updated",
              variant: "success",
            })
          }}
          validator={validator}
        >
          <TextArea
            description="Custom description that the client wants to show on the product"
            label="Description"
            name="description"
          />
          <Input
            label="Quantity"
            min={0}
            name="quantity"
            step="1"
            type="number"
          />
          <Input label="Stock" min={0} name="stock" step="1" type="number" />
          <div className="flex justify-end gap-x-4">
            {itemPurchaseCount === 0 && (
              <Link to="delete">
                <Button variant="danger">Delete</Button>
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
