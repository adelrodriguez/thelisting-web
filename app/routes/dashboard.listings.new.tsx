import { ListingType } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { useSubmit } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { format, startOfTomorrow, subMilliseconds } from "date-fns"
import { getTimezoneOffset } from "date-fns-tz"
import { StatusCodes } from "http-status-codes"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import { unauthorized } from "remix-utils"
import { z } from "zod"

import {
  Form,
  Input,
  InputWithAddOn,
  Select,
  SubmitButton,
} from "~/components/form"
import auth from "~/helpers/auth.server"
import { CreateListingCommerceEntityQueue } from "~/helpers/queues"
import {
  ListingEventDateSchema,
  ListingOwnerSchema,
  ListingPathSchema,
  ListingTitleSchema,
  ListingTypeSchema,
} from "~/utils/listing"
import { json, redirect, useActionData, useLoaderData } from "~/utils/remix"
import { getUserFullName } from "~/utils/user"

export const handle = {
  crumb: () => ({
    href: `/dashboard/listings/new/`,
    name: "New Listing",
  }),
}

const clientValidator = withZod(
  z.object({
    eventDate: ListingEventDateSchema,
    ownerId: ListingOwnerSchema,
    path: ListingPathSchema,
    title: ListingTitleSchema,
    type: ListingTypeSchema,
  })
)

export async function loader({ request, context }: LoaderArgs) {
  const { db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) throw unauthorized("You must be logged in to create a listing")

  const users = await db.user.findMany({
    orderBy: { firstName: "asc" },
    select: { firstName: true, id: true, lastName: true },
  })

  return json({ users })
}

export async function action({ request, context }: ActionArgs) {
  const { db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized("You must be logged in to create a listing")
  }

  const serverValidator = withZod(
    z.object({
      eventDate: ListingEventDateSchema,
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
          { message: "The path you have entered is already in use." }
        ),
      title: ListingTitleSchema,
      type: ListingTypeSchema,
    })
  )

  const formData = await request.formData()
  const result = await serverValidator.validate(formData)

  if (result.error)
    return json(
      { ...result.error, listing: null, success: false },
      { status: StatusCodes.UNPROCESSABLE_ENTITY }
    )

  const listing = await db.listing.create({
    data: result.data,
  })

  await CreateListingCommerceEntityQueue.add(`${listing.sku}`, {
    listingId: listing.id,
  })

  return redirect("/dashboard/listings/")
}

export default function CreateListingsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { users } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

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
    <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-gray-600">
          Listings
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
          Create a new listing
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
          Create a new listing for your event
        </p>
      </div>
      <Form
        id="create-listing"
        validator={clientValidator}
        method="POST"
        className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
        onSubmit={(data, event) => {
          event.preventDefault()

          const timezoneOffsetInMilliseconds = getTimezoneOffset(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            data.eventDate
          )

          const eventDate = subMilliseconds(
            data.eventDate,
            timezoneOffsetInMilliseconds
          ).toISOString()

          submit(
            {
              ...data,
              eventDate,
            },
            { method: "POST" }
          )
        }}
      >
        <Input
          label="Title"
          name="title"
          description="This is what we'll call your listing and show to others"
          required
        />
        <InputWithAddOn
          name="path"
          label="Path"
          addOn={"https://www.giftthelisting.com/"}
          description="The unique path for your listing"
          required
        />
        <Input
          type="date"
          label="Event Date"
          name="eventDate"
          min={format(startOfTomorrow(), "yyyy-MM-dd")}
          description="The date of your event"
          required
        />
        <Select
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
          label="Event Type"
          name="type"
          description="The type of event you're hosting"
          required
        />
        <Select
          options={[
            { label: "Select an option", value: "" },
            ...users.map((user) => ({
              label: getUserFullName(user),
              value: user.id,
            })),
          ]}
          label="Owner"
          name="ownerId"
          description="The owner of this listing"
          required
        />
        <SubmitButton loadingText="Creating...">Create</SubmitButton>
      </Form>
    </div>
  )
}
