import { ListingStatus, ListingType, UserRole } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { RouteMatch } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { startOfTomorrow } from "date-fns"
import { useSnackbar } from "notistack"
import { useState, useEffect } from "react"
import { unauthorized } from "remix-utils"
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
import { Forbidden, getFormData, NotFound } from "~/utils/http.server"
import {
  CommerceIdSchema,
  EventDateSchema,
  PathSchema,
  StatusSchema,
  TitleSchema,
  TypeSchema,
} from "~/utils/listing"
import { isWindowDefined } from "~/utils/window"

export const handle = {
  crumb: ({ params }: RouteMatch) => ({
    href: `/dashboard/listings/${params.sku}/`,
    name: "Details",
  }),
  id: "dashboard-listings-edit",
}

const EditListingSchema = z.object({
  commerceId: CommerceIdSchema,
  eventDate: EventDateSchema,
  path: PathSchema,
  status: StatusSchema,
  title: TitleSchema,
  type: TypeSchema,
})

const validator = withZod(EditListingSchema)

export async function loader({ params }: LoaderArgs) {
  const sku = params.sku

  if (!sku) throw NotFound

  if (isNaN(Number(sku))) throw NotFound

  const listing = await prisma.listing.findUnique({
    where: { sku: Number(sku) },
  })

  if (!listing) throw NotFound

  return json(setFormDefaults("editListing", listing))
}

export async function action({ request, params }: ActionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) throw unauthorized("You must be logged in to update a listing.")

  const sku = params.sku

  if (!sku) throw NotFound

  if (isNaN(Number(sku))) throw NotFound

  const listing = await prisma.listing.findUnique({
    where: { sku: Number(sku) },
  })

  if (!listing) throw NotFound

  const formData = await getFormData(request)
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  if (listing.ownerId !== user.id && user.role !== UserRole.Admin) {
    throw Forbidden
  }

  await prisma.listing.update({
    data: { ...result.data },
    where: { id: listing.id },
  })

  return null
}

export default function DashboardListingPage() {
  const { enqueueSnackbar } = useSnackbar()
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
      />
      <FormDate
        label="Event Date"
        name="eventDate"
        min={startOfTomorrow()}
        description="The date of your event"
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
        description="The Shopify collection ID. You need to have this in order to be able to add items to your listing. If this is empty and you recently created the listing, please wait a few seconds."
        label="Commerce ID"
        name="commerceId"
        disabled
      />
      <FormSubmit text="Update" loadingText="Updating..." />
    </ValidatedForm>
  )
}
