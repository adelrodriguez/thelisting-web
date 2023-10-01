import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useQuery } from "@tanstack/react-query"
import { useSnackbar } from "notistack"
import { Fragment, useEffect } from "react"
import { useFormContext, validationError } from "remix-validated-form"
import { route } from "routes-gen"
import { z } from "zod"

import { Alert, Button } from "~/components/common"
import { Autocomplete, Form, Input, SubmitButton } from "~/components/form"
import { CURRENCIES, DEFAULT_MARGIN } from "~/config/consts"
import { AddItemToListingQueue } from "~/helpers/queues"
import { useScrapedProducts } from "~/routes/dashboard.admin.product-scraper/route"
import { useDialogPage } from "~/utils/hooks"

const AddToListingSchema = z.object({
  exchangeRate: z.coerce.number().min(1),
  listingId: z.string().uuid(),
  margin: z.coerce.number().min(0).max(100),
  products: z
    .array(
      z.object({
        quantity: z.coerce.number().min(1),
        rowId: z.string(),
        scrapedProductId: z.string().uuid(),
      }),
    )
    .min(1),
})

const validator = withZod(AddToListingSchema)

export async function loader({ context }: LoaderFunctionArgs) {
  const db = context.db

  const listings = await db.listing.findMany({
    where: { commerceId: { not: null } },
  })

  return json({ listings })
}

export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.db

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  const { listingId, margin, products, exchangeRate } = result.data

  const listing = await db.listing.findUniqueOrThrow({
    where: { id: listingId },
  })

  await AddItemToListingQueue.addBulk(
    products.map(({ scrapedProductId, rowId, quantity }) => ({
      data: {
        exchangeRate,
        listingId,
        margin,
        quantity,
        rowId,
        scrapedProductId,
      },
      name: `${listing.sku}-${rowId}`,
      opts: { attempts: 7, backoff: { delay: 1000, type: "exponential" } },
    })),
  )

  return redirect(route("/dashboard/admin/product-scraper"))
}

export default function AddToListingPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { products } = useScrapedProducts()
  const { listings } = useLoaderData<typeof loader>()
  const { open, close, leave } = useDialogPage()
  const { getValues, fieldErrors } = useFormContext("addToListing")

  const values = getValues()
  const margin = values.get("margin")
  const listing = listings.find(({ id }) => id === values.get("listingId"))
  const productFields = products
    .filter(
      (product): product is typeof product & { scrapedProductId: string } =>
        !!product.scrapedProductId,
    )
    .map(({ id, scrapedProductId, quantity }) => ({
      quantity,
      rowId: `${id}`,
      scrapedProductId,
    }))

  const { data: currencyData } = useQuery({
    queryFn: async () => {
      const res = await fetch("/api/exchange-rates/" + CURRENCIES.USD)
      const data = (await res.json()) as { exchangeRate: number }

      return data as { exchangeRate: number }
    },
    queryKey: ["exchange-rates", CURRENCIES.USD],
  })

  useEffect(() => {
    if (products.length === 0) {
      leave()
    }
  }, [products.length, leave])

  useEffect(() => {
    if (currencyData) {
      // We use the DOM API here because we can't use a ref to the input and we
      // don't want it to be a controlled component
      const input = document.getElementById("exchangeRate") as HTMLInputElement
      input.value = currencyData.exchangeRate.toString()
    }
  }, [currencyData])

  return (
    <Transition.Root appear as={Fragment} show={open}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                afterLeave={leave}
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <Form
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    defaultValues={{
                      exchangeRate: currencyData?.exchangeRate ?? 1,
                      listingId: undefined,
                      margin: DEFAULT_MARGIN,
                      products: productFields,
                    }}
                    id="addToListing"
                    method="POST"
                    onSubmit={() => {
                      enqueueSnackbar("Items are being added to the listing", {
                        description:
                          "Process will be running in the background",
                        variant: "success",
                      })
                    }}
                    validator={validator}
                  >
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            Add items to listing
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              onClick={close}
                              type="button"
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                aria-hidden="true"
                                className="h-6 w-6"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-1 flex-col gap-y-6 px-4 sm:px-6">
                        <Autocomplete
                          description="Select a listing to add the products to."
                          label="Listing"
                          name="listingId"
                          options={[
                            {
                              label: "Select a listing",
                              value: undefined,
                            },
                            ...listings.map((listing) => ({
                              label: `${listing.sku} - ${listing.title}`,
                              value: listing.id,
                            })),
                          ]}
                        />
                        <Input
                          description="The margin to add to the product price, from 0% to a 100%."
                          label="Gross Profit Margin"
                          max={100}
                          min={0}
                          name="margin"
                          step={0.1}
                          trailing="%"
                          type="number"
                        />
                        <Input
                          description="The exchange rate from USD to DOP, for products with USD prices."
                          label="Exchange Rate USD to DOP"
                          min={1}
                          name="exchangeRate"
                          step={0.01}
                          type="number"
                        />

                        {productFields.map(
                          ({ scrapedProductId, rowId }, index) => (
                            <div
                              className="hidden"
                              key={`${rowId}-${scrapedProductId}`}
                            >
                              <Input
                                label="Row ID"
                                name={`products[${index}].rowId`}
                                type="hidden"
                              />
                              <Input
                                label="Scraped Product ID"
                                name={`products[${index}].scrapedProductId`}
                                type="hidden"
                              />
                              <Input
                                label="Quantity"
                                name={`products[${index}].quantity`}
                                type="hidden"
                              />
                            </div>
                          ),
                        )}
                        <Alert type="info">
                          You will be adding{" "}
                          <span className="font-bold">{products.length}</span>{" "}
                          items to the listing &ldquo;
                          <span className="font-bold">{listing?.title}</span>
                          &rdquo; with a margin of{" "}
                          <span className="font-bold">{`${margin}%`}</span>.
                        </Alert>
                        {Object.keys(fieldErrors).length > 0 && (
                          <Alert type="error">
                            Please fix the errors in the form.
                            <pre>{JSON.stringify(fieldErrors)}</pre>
                          </Alert>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end gap-x-4 px-4 py-4">
                      <Button onClick={close} variant="secondary">
                        Cancel
                      </Button>
                      <SubmitButton loadingText="Adding items...">
                        Submit
                      </SubmitButton>
                    </div>
                  </Form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
