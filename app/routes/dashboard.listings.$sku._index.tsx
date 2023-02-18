import { ListingStatus, ListingType, UserRole } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import type { RouteMatch } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { startOfTomorrow } from "date-fns"
import { useSnackbar } from "notistack"
import { useState, useEffect } from "react"
import { forbidden, notFound, unauthorized } from "remix-utils"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"

import {
  FormInput,
  FormDate,
  FormSubmit,
  FormListRadioGroup,
  FormSelect,
} from "~/components/form"
import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import { getFormData } from "~/utils/http.server"
import {
  CommerceIdSchema,
  EventDateSchema,
  ImageSchema,
  PathSchema,
  StatusSchema,
  SubtitleSchema,
  TitleSchema,
  TypeSchema,
} from "~/utils/listing"
import { json, useLoaderData } from "~/utils/remix"
import { getUserFullName } from "~/utils/user"
import { isWindowDefined } from "~/utils/window"

export const handle = {
  crumb: ({ params, data }: RouteMatch) => ({
    href: `/dashboard/listings/${params.sku}/`,
    name: "Details",
  }),
  id: "dashboard-listings-edit",
}

const EditListingSchema = z.object({
  commerceId: CommerceIdSchema,
  coverImage: ImageSchema,
  eventDate: EventDateSchema,
  ownerId: z.string().uuid(),
  path: PathSchema,
  status: StatusSchema,
  subtitle: SubtitleSchema,
  thankYouImage: ImageSchema,
  title: TitleSchema,
  type: TypeSchema,
})

const validator = withZod(EditListingSchema)

export async function loader({ params }: LoaderArgs) {
  const sku = params.sku

  if (!sku) throw notFound("Listing not found")

  if (isNaN(Number(sku))) throw notFound("Listing not found")

  const [listing, users] = await Promise.all([
    prisma.listing.findUnique({
      where: { sku: Number(sku) },
    }),
    prisma.user.findMany({
      orderBy: { firstName: "asc" },
      select: { firstName: true, id: true, lastName: true },
    }),
  ])

  if (!listing) throw notFound("Listing not found")

  return json({ listing, users, ...setFormDefaults("editListing", listing) })
}

export async function action({ request, params }: ActionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) throw unauthorized("You must be logged in to update a listing.")

  const sku = params.sku

  if (!sku) throw notFound("Listing not found")

  if (isNaN(Number(sku))) throw notFound("Listing not found")

  const listing = await prisma.listing.findUnique({
    where: { sku: Number(sku) },
  })

  if (!listing) throw notFound("Listing not found")

  const formData = await getFormData(request)
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  if (listing.ownerId !== user.id && user.role !== UserRole.Admin) {
    throw forbidden({
      message: "You do not have permission to update this listing.",
    })
  }

  const updatedListing = await prisma.listing.update({
    data: result.data,
    where: { id: listing.id },
  })

  return json({ listing: updatedListing })
}

export default function DashboardListingPage() {
  const { enqueueSnackbar } = useSnackbar()
  const { users } = useLoaderData<typeof loader>()
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (isWindowDefined()) {
      setOrigin(window.location.origin)
    }
  }, [])

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
      id="editListing"
      onSubmit={() => {
        enqueueSnackbar("Listing updated 🎉", {
          description: "The listing was successfully updated",
          variant: "success",
        })
      }}
    >
      <FormInput
        label="Title"
        name="title"
        description="This is what we'll call your listing and show to others"
        required
      />
      <FormInput
        label="Subtitle"
        name="subtitle"
        description="This will appear under the title and in the description when sharing your listing"
      />
      <FormInput
        label="SKU"
        name="sku"
        disabled
        description="This is the unique identifier for your listing"
      />
      <FormInput
        name="path"
        label="Path"
        addOn={origin}
        description="The unique path for your listing"
        required
      />
      <FormDate
        label="Event Date"
        name="eventDate"
        min={startOfTomorrow()}
        description="The date of your event"
        required
      />
      <FormSelect
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
      <FormSelect
        options={users.map((user) => ({
          label: getUserFullName(user),
          value: user.id,
        }))}
        label="Owner"
        name="ownerId"
        required
      />
      <FormListRadioGroup
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
      <FormInput
        label="Cover Image"
        name="coverImage"
        description="The image that will be shown on the listing page"
      />
      <FormInput
        label={'"Thank You" Image'}
        name="thankYouImage"
        description="The image that will be shown after someone purchases an item from your listing"
      />
      <FormInput
        description="The Shopify collection ID. You need to have this in order to be able to add items to your listing. If this is empty and you recently created the listing, please wait a few seconds."
        label="Commerce ID"
        name="commerceId"
        disabled
      />
      <FormSubmit text="Update" loadingText="Updating..." />
    </ValidatedForm>
  )
}
