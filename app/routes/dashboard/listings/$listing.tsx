import { ListingStatus, ListingType, UserRole } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { startOfTomorrow } from "date-fns"
import { redirect } from "react-router"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"

import { FormInput, FormDate, FormSelect, FormSubmit } from "~/components/form"
import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import {
  Forbidden,
  getFormData,
  NotFound,
  Unauthorized,
} from "~/utils/http.server"
import {
  CommerceIdSchema,
  EventDateSchema,
  PathSchema,
  StatusSchema,
  TitleSchema,
  TypeSchema,
} from "~/utils/listing"
import { getShopifyIdNumber } from "~/utils/shopify"

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
  const path = params.listing

  const listing = await prisma.listing.findUnique({
    where: { path },
  })

  if (!listing) throw NotFound

  return json(
    setFormDefaults("listing", {
      ...listing,
      commerceId: listing.commerceId && getShopifyIdNumber(listing.commerceId),
    })
  )
}

export async function action({ request, params }: ActionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) throw Unauthorized

  const path = params.listing
  const listing = await prisma.listing.findUnique({
    where: { path },
  })

  if (!listing) throw NotFound

  const formData = await getFormData(request)
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  if (listing.ownerId !== user.id && user.role !== UserRole.Admin) {
    throw Forbidden
  }

  const updated = await prisma.listing.update({
    data: { ...result.data },
    where: { id: listing.id },
  })

  return redirect(`/dashboard/listings/${updated.path}`)
}

export default function DashboardListingPage() {
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
      id="listing"
    >
      <FormInput
        label="Title"
        name="title"
        description="This is what we'll call your listing and show to others"
      />
      <FormInput
        name="path"
        label="Path"
        addOn="https://thelisting.do/"
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
      <FormSelect
        options={[
          {
            label: "Draft",
            value: ListingStatus.Draft,
          },
          {
            label: "Published",
            value: ListingStatus.Published,
          },
          {
            label: "Closed",
            value: ListingStatus.Closed,
          },
        ]}
        label="Status"
        name="status"
        disabled
      />
      <FormInput
        addOn="gid://shopify/Collection/"
        description="The Shopify collection ID. You need to add this in order to be able to add items to your listing."
        label="Commerce ID"
        name="commerceId"
      />
      <FormSubmit text="Update" loadingText="Updating..." />
    </ValidatedForm>
  )
}
