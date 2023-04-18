import { ListingStatus, ListingType, UserRole } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import type { RouteMatch } from "@remix-run/react"
import { useSubmit } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { format, startOfTomorrow, subMilliseconds } from "date-fns"
import { getTimezoneOffset } from "date-fns-tz"
import { StatusCodes } from "http-status-codes"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import { forbidden, notFound, unauthorized } from "remix-utils"
import { setFormDefaults } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import {
  Form,
  ImageInput,
  Input,
  InputWithAddOn,
  ListRadioGroup,
  Select,
  SubmitButton,
} from "~/components/form"
import auth from "~/helpers/auth.server"
import {
  ListingCoverImageSchema,
  ListingEventDateSchema,
  ListingOwnerSchema,
  ListingPathSchema,
  ListingStatusSchema,
  ListingSubtitleSchema,
  ListingThankYouImageSchema,
  ListingTitleSchema,
  ListingTypeSchema,
} from "~/utils/listing"
import { json, useActionData, useLoaderData } from "~/utils/remix"
import { getUserFullName } from "~/utils/user"

export const handle = {
  crumb: ({ params }: RouteMatch) => ({
    href: `/dashboard/listings/${params.listing}/details`,
    name: "Details",
  }),
  id: "dashboard-listings-details",
}

const clientValidator = withZod(
  z.object({
    coverImage: ListingCoverImageSchema,
    eventDate: ListingEventDateSchema,
    ownerId: ListingOwnerSchema,
    path: ListingPathSchema,
    status: ListingStatusSchema,
    subtitle: z.string().optional(),
    thankYouImage: ListingThankYouImageSchema,
    title: ListingTitleSchema,
    type: ListingTypeSchema,
  })
)

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const { listing: sku } = zx.parseParams(params, {
    listing: z.coerce.number(),
  })

  const [listing, users] = await Promise.all([
    db.listing.findUnique({ where: { sku } }),
    db.user.findMany({
      orderBy: { firstName: "asc" },
      select: { firstName: true, id: true, lastName: true },
    }),
  ])

  if (!listing) {
    throw notFound({
      message: "Listing not found",
      title: "Listing not found",
    })
  }

  return json({
    users,
    ...setFormDefaults("edit-listing", {
      ...listing,
      eventDate: format(listing.eventDate, "yyyy-MM-dd"),
    }),
  })
}

export async function action({ request, params, context }: ActionArgs) {
  const db = context.db
  const user = await auth.isAuthenticated(request)

  if (!user) throw unauthorized("You must be logged in to update a listing.")

  const { listing: sku } = zx.parseParams(
    params,
    z.object({ listing: z.coerce.number() })
  )

  const listing = await db.listing.findUniqueOrThrow({
    where: { sku: Number(sku) },
  })

  if (listing.ownerId !== user.id && user.role !== UserRole.Admin) {
    throw forbidden({
      message: "You do not have permission to update this listing.",
    })
  }

  const serverValidator = withZod(
    z.object({
      coverImage: ListingCoverImageSchema,
      eventDate: ListingEventDateSchema,
      ownerId: ListingOwnerSchema,
      path: ListingPathSchema.trim()
        .transform((value) => value.toLowerCase())
        .refine(
          async (path) => {
            const existingListing = await db.listing.findFirst({
              select: { id: true },
              where: { path },
            })

            if (!existingListing) return true

            return existingListing.id === listing.id
          },
          { message: "The path you have entered is already in use." }
        ),
      status: ListingStatusSchema,
      subtitle: ListingSubtitleSchema,
      thankYouImage: ListingThankYouImageSchema,
      title: ListingTitleSchema,
      type: ListingTypeSchema,
    })
  )

  const formData = await request.formData()
  const result = await serverValidator.validate(formData)

  if (result.error) {
    return json(
      { ...result.error, data: null, success: false },
      { status: StatusCodes.UNPROCESSABLE_ENTITY }
    )
  }

  const updatedListing = await db.listing.update({
    data: result.data,
    where: { id: listing.id },
  })

  return json({ data: updatedListing, success: true })
}

export default function DashboardListingPage() {
  const { enqueueSnackbar } = useSnackbar()
  const submit = useSubmit()
  const { users } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (!actionData) return

    if (actionData.success) {
      enqueueSnackbar("Listing updated 🎉", {
        description: "The listing was successfully updated",
        variant: "success",
      })
    } else {
      enqueueSnackbar("Error updating listing", {
        description: "There was an error updating the listing",
        variant: "error",
      })
    }
  }, [actionData, enqueueSnackbar])

  return (
    <Form
      id="edit-listing"
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
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
      validator={clientValidator}
    >
      <Input
        label="Title"
        name="title"
        description="This is what we'll call your listing and show to others"
        required
      />
      <Input
        label="Subtitle"
        name="subtitle"
        description="This will appear under the title and in the description when sharing your listing"
      />
      <Input
        label="SKU"
        name="sku"
        disabled
        description="This is the unique identifier for your listing"
      />
      <InputWithAddOn
        label="Path"
        name="path"
        description="This is the URL for your listing"
        addOn={"https://giftthelisting.com/"}
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
      <Select
        options={[
          {
            label: "Select an option",
            value: "",
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
        description="The user owner of this listing"
        required
      />
      <ListRadioGroup
        name="status"
        label="Status"
        options={[
          {
            description:
              "The listing is not visible to others, you can still edit it and add items",
            label: "Draft",
            value: ListingStatus.Draft,
          },
          {
            description: "The listing is visible to others",
            label: "Published",
            value: ListingStatus.Published,
          },
          {
            description:
              "The listing is closed, it is no longer visible to others and you can no longer edit it",
            label: "Closed",
            value: ListingStatus.Closed,
          },
        ]}
        required
      />
      <ImageInput
        label="Registry Cover Image"
        name="coverImage"
        description="The image that will be shown on the registry page"
        placeholder="cover.png"
        required
      />
      <ImageInput
        label={'"Thank You" Image'}
        name="thankYouImage"
        description="The image that will be shown after someone purchases an item from your listing"
        placeholder="thank-you.png"
      />
      <Input
        description="The Shopify collection ID. You need to have this in order to be able to add items to your listing. If this is empty and you recently created the listing, please wait a few seconds."
        label="Commerce ID"
        name="commerceId"
        disabled
      />
      <SubmitButton loadingText="Updating...">Update</SubmitButton>
    </Form>
  )
}
