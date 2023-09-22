import { ListingStatus, ListingType, UserRole } from "@prisma/client"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData, useLoaderData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { format, subMilliseconds } from "date-fns"
import { getTimezoneOffset } from "date-fns-tz"
import { StatusCodes } from "http-status-codes"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import { setFormDefaults } from "remix-validated-form"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { zx } from "zodix"

import {
  Autocomplete,
  Checkbox,
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
import { forbidden, notFound, unauthorized } from "~/utils/remix"
import { getUserFullName } from "~/utils/user"

export const handle = {
  // @ts-expect-error find the recommended typing for matches
  crumb: ({ params }) => ({
    href: `/dashboard/listings/${params.listing}/`,
    name: "Details",
  }),
  id: "dashboard-listings-details",
}

const clientValidator = withZod(
  z.object({
    coverImage: ListingCoverImageSchema,
    eventDate: ListingEventDateSchema,
    isInternal: zfd.checkbox({ trueValue: "internal" }),
    ownerId: ListingOwnerSchema,
    path: ListingPathSchema,
    status: ListingStatusSchema,
    subtitle: z.string().optional(),
    thankYouImage: ListingThankYouImageSchema,
    timezone: z.string().optional(),
    title: ListingTitleSchema,
    type: ListingTypeSchema,
  })
)

export async function loader({ params, context }: LoaderFunctionArgs) {
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
    throw notFound({ message: "Listing not found.", title: "Not Found" })
  }

  return json({
    users,
    ...setFormDefaults("edit-listing", {
      ...listing,
      eventDate: format(listing.eventDate, "yyyy-MM-dd"),
    }),
  })
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const db = context.db
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized({
      message: "You must be logged in to do that.",
      title: "Unauthorized",
    })
  }

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
      title: "Forbidden",
    })
  }

  const formData = await request.formData()
  const timezone = formData.get("timezone") as string

  const serverValidator = withZod(
    z.object({
      coverImage: ListingCoverImageSchema,
      eventDate: ListingEventDateSchema.transform((value) => {
        const timezoneOffsetInMilliseconds = getTimezoneOffset(timezone, value)

        return subMilliseconds(value, timezoneOffsetInMilliseconds)
      }),
      isInternal: zfd.checkbox({ trueValue: "internal" }),
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

  const result = await serverValidator.validate(formData)

  if (result.error) {
    return json(
      { ...result.error, listing: null, success: false },
      { status: StatusCodes.UNPROCESSABLE_ENTITY }
    )
  }

  const updatedListing = await db.listing.update({
    data: result.data,
    where: { id: listing.id },
  })

  if (updatedListing.status !== listing.status) {
    switch (updatedListing.status) {
      case ListingStatus.Published:
        await db.listing.update({
          data: {
            closedAt: null,
            publishedAt: new Date(),
          },
          where: { id: updatedListing.id },
        })
        break
      case ListingStatus.Closed:
        await db.listing.update({
          data: {
            closedAt: new Date(),
          },
          where: { id: updatedListing.id },
        })
        break
      default:
        await db.listing.update({
          data: {
            closedAt: null,
            publishedAt: null,
          },
          where: { id: updatedListing.id },
        })
        break
    }
  }

  return json({ listing: updatedListing, success: true })
}

export default function DashboardListingPage() {
  const { enqueueSnackbar } = useSnackbar()
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
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
      id="edit-listing"
      method="POST"
      validator={clientValidator}
    >
      <Input
        description="This is what we'll call your listing and show to others"
        label="Title"
        name="title"
        required
      />
      <Input
        description="This will appear under the title and in the description when sharing your listing"
        label="Subtitle"
        name="subtitle"
      />
      <Input
        description="This is the unique identifier for your listing"
        disabled
        label="SKU"
        name="sku"
      />
      <InputWithAddOn
        addOn={"https://giftthelisting.com/"}
        description="This is the URL for your listing"
        label="Path"
        name="path"
        required
      />
      <Input
        description="The date of your event"
        label="Event Date"
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
        required
      />
      <Autocomplete
        description="The user owner of this listing"
        label="Owner"
        name="ownerId"
        options={[
          { label: "Select an option", value: "" },
          ...users.map((user) => ({
            label: getUserFullName(user),
            value: user.id,
          })),
        ]}
        required
      />
      <ListRadioGroup
        label="Status"
        name="status"
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
        description="The image that will be shown on the registry page"
        label="Registry Cover Image"
        name="coverImage"
        placeholder="cover.png"
      />
      <ImageInput
        description="The image that will be shown after someone purchases an item from your listing"
        label={'"Thank You" Image'}
        name="thankYouImage"
        placeholder="thank-you.png"
      />
      <Input
        description="The Shopify collection ID. You need to have this in order to be able to add items to your listing. If this is empty and you recently created the listing, please wait a few seconds."
        disabled
        label="Commerce ID"
        name="commerceId"
      />
      <Checkbox
        description="Internal listings are used for showcase purposes. Purchases are disabled."
        label="Internal"
        name="isInternal"
        value="internal"
      />
      <SubmitButton loadingText="Updating...">Update</SubmitButton>
    </Form>
  )
}
