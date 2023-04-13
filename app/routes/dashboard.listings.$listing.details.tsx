import { ListingStatus, ListingType, UserRole } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import type { RouteMatch } from "@remix-run/react"
import { useSubmit } from "@remix-run/react"
import { format, startOfTomorrow } from "date-fns"
import { zonedTimeToUtc } from "date-fns-tz"
import { useSnackbar } from "notistack"
import type { FormEvent } from "react"
import { useEffect } from "react"
import { forbidden, notFound, unauthorized } from "remix-utils"
import { z } from "zod"
import { zx } from "zodix"

import {
  ImageInput,
  Input,
  InputWithAddOn,
  ListRadioGroup,
  Select,
  SubmitButton,
  ValidationErrors,
} from "~/components/form"
import auth from "~/helpers/auth.server"
import { flattenErrors } from "~/utils/form"
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

  if (!listing)
    throw notFound({
      message: "Listing not found",
      title: "Listing not found",
    })

  return json({ listing, users })
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

  const formData = await zx.parseFormSafe(
    request,
    z.object({
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
      title: ListingTitleSchema,
      type: ListingTypeSchema,
    })
  )

  if (!formData.success) {
    return json({ errors: flattenErrors(formData.error), listing: null })
  }

  const updatedListing = await db.listing.update({
    data: formData.data,
    where: { id: listing.id },
  })

  return json({ errors: null, listing: updatedListing })
}

export default function DashboardListingPage() {
  const { enqueueSnackbar } = useSnackbar()
  const submit = useSubmit()
  const { listing, users } = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  useEffect(() => {
    if (!data) return

    if (!data.errors) {
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
  }, [data, enqueueSnackbar])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const $form = event.currentTarget
    const formData = new FormData($form)

    const eventDate = formData.get("eventDate") as string

    // Convert the event date to UTC
    formData.set(
      "eventDate",
      zonedTimeToUtc(
        eventDate,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ).toISOString()
    )

    submit(formData, { method: "POST" })
  }

  return (
    <form
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
      onSubmit={handleSubmit}
    >
      <ValidationErrors errors={data?.errors} />
      <Input
        label="Title"
        name="title"
        description="This is what we'll call your listing and show to others"
        required
        schema={ListingTitleSchema}
        defaultValue={listing.title}
      />
      <Input
        label="Subtitle"
        name="subtitle"
        description="This will appear under the title and in the description when sharing your listing"
        schema={ListingSubtitleSchema}
        defaultValue={listing.subtitle ?? ""}
      />
      <Input
        label="SKU"
        name="sku"
        disabled
        description="This is the unique identifier for your listing"
        defaultValue={listing.sku}
      />
      <InputWithAddOn
        label="Path"
        name="path"
        description="This is the URL for your listing"
        defaultValue={listing.path}
        addOn={"https://giftthelisting.com/"}
        schema={ListingPathSchema}
        required
      />
      <Input
        defaultValue={format(listing.eventDate, "yyyy-MM-dd")}
        description="The date of your event"
        label="Event Date"
        min={format(startOfTomorrow(), "yyyy-MM-dd")}
        name="eventDate"
        required
        schema={z.string()}
        type="date"
      />
      <Select
        defaultValue={listing.type}
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
        schema={ListingTypeSchema}
      />
      <Select
        defaultValue={listing.ownerId}
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
        schema={ListingOwnerSchema}
      />
      <ListRadioGroup
        defaultValue={listing.status}
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
        defaultValue={listing.coverImage || ""}
        label="Cover Image"
        name="coverImage"
        description="The image that will be shown on the listing page"
        placeholder="cover.png"
        required
        schema={ListingCoverImageSchema}
      />
      <ImageInput
        defaultValue={listing.thankYouImage || ""}
        label={'"Thank You" Image'}
        name="thankYouImage"
        description="The image that will be shown after someone purchases an item from your listing"
        placeholder="thank-you.png"
        schema={ListingThankYouImageSchema}
      />
      <Input
        defaultValue={listing.commerceId || ""}
        description="The Shopify collection ID. You need to have this in order to be able to add items to your listing. If this is empty and you recently created the listing, please wait a few seconds."
        label="Commerce ID"
        name="commerceId"
        disabled
      />
      <SubmitButton loadingText="Updating...">Update</SubmitButton>
    </form>
  )
}
