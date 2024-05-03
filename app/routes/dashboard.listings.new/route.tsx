import { ListingType } from "@prisma/client"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useActionData, useLoaderData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { format, startOfTomorrow, subMilliseconds } from "date-fns"
import { getTimezoneOffset } from "date-fns-tz"
import { StatusCodes } from "http-status-codes"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import { route } from "routes-gen"
import { z } from "zod"

import { Autocomplete, Form, Input, InputWithAddOn, Select, SubmitButton } from "~/components/form"
import auth from "~/helpers/auth.server"
import { CreateListingCommerceEntityQueue } from "~/helpers/queues"
import { unauthorized } from "~/utils/http"
import {
  ListingEventDateSchema,
  ListingOwnerSchema,
  ListingPathSchema,
  ListingTitleSchema,
  ListingTypeSchema,
} from "~/utils/listing"
import type { RouteHandle } from "~/utils/remix"
import { getFullName } from "~/utils/user"

export const handle: RouteHandle = {
  crumb: () => ({
    href: route("/dashboard/listings/new"),
    name: "New Listing",
  }),
  id: "dashboard-listings-new",
}

const clientValidator = withZod(
  z.object({
    eventDate: ListingEventDateSchema.min(startOfTomorrow(), "Event date must be in the future"),
    ownerId: ListingOwnerSchema,
    path: ListingPathSchema,
    title: ListingTitleSchema,
    type: ListingTypeSchema,
  }),
)

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) throw unauthorized({ message: "You must be logged in to create a listing" })

  const users = await db.user.findMany({
    orderBy: { firstName: "asc" },
    select: { firstName: true, id: true, lastName: true },
  })

  return json({ users })
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized({ message: "You must be logged in to create a listing" })
  }

  const formData = await request.formData()
  const timezone = formData.get("timezone") as string

  const serverValidator = withZod(
    z.object({
      eventDate: ListingEventDateSchema.transform((value) => {
        const timezoneOffsetInMilliseconds = getTimezoneOffset(timezone, value)

        return subMilliseconds(value, timezoneOffsetInMilliseconds)
      }),
      ownerId: ListingOwnerSchema,
      path: ListingPathSchema.trim()
        .transform((value) => value.toLowerCase())
        .refine(
          async (path) => {
            const listings = await db.listing.count({
              where: { path },
            })

            return listings === 0
          },
          { message: "The path you have entered is already in use." },
        ),
      title: ListingTitleSchema,
      type: ListingTypeSchema,
    }),
  )

  const result = await serverValidator.validate(formData)

  if (result.error)
    return json(
      { ...result.error, listing: null, success: false },
      { status: StatusCodes.UNPROCESSABLE_ENTITY },
    )

  const listing = await db.listing.create({
    data: result.data,
  })

  await CreateListingCommerceEntityQueue.add(`${listing.sku}`, {
    listingId: listing.id,
  })

  return redirect(route("/dashboard/listings"))
}

export default function CreateListingsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { users } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (!actionData) return

    if (actionData.success) {
      enqueueSnackbar("Listing created 🎉", {
        description:
          "The listing was successfully created. The Shopify collection will be created shortly.",
        variant: "success",
      })
    } else {
      enqueueSnackbar("Error creating listing", {
        description: "There was an error creating the listing",
        variant: "error",
      })
    }
  }, [actionData, enqueueSnackbar])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-gray-600">Listings</p>
        <h2 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
          Create a new listing
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
          Create a new listing for your event
        </p>
      </div>
      <Form
        className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
        id="create-listing"
        method="POST"
        validator={clientValidator}
      >
        <Input
          description="This is what we'll call your listing and show to others"
          label="Title"
          name="title"
          required
        />
        <InputWithAddOn
          addOn={"https://www.giftthelisting.com/"}
          description="The unique path for your listing"
          label="Path"
          name="path"
          required
        />
        <Input
          description="The date of your event"
          label="Event Date"
          min={format(startOfTomorrow(), "yyyy-MM-dd")}
          name="eventDate"
          required
          type="date"
        />
        <input
          name="timezone"
          type="hidden"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
        <Select
          description="The type of event you're hosting"
          label="Event Type"
          name="type"
          options={[
            {
              label: "Select an option",
              value: undefined,
            },
            {
              label: "💍 Wedding",
              value: ListingType.Wedding,
            },
            {
              label: "🍼 Baby Shower",
              value: ListingType.BabyShower,
            },
            {
              label: "🎂 Birthday",
              value: ListingType.Birthday,
            },
            {
              label: "❓ Other",
              value: ListingType.Other,
            },
          ]}
          required
        />
        <Autocomplete
          description="The owner of this listing"
          label="Owner"
          name="ownerId"
          options={[
            { label: "Select an option", value: "" },
            ...users.map((user) => ({
              label: getFullName(user),
              value: user.id,
            })),
          ]}
          required
        />
        <SubmitButton loadingText="Creating...">Create</SubmitButton>
      </Form>
    </div>
  )
}
