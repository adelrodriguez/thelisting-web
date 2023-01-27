import { ListingType } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { format, startOfTomorrow } from "date-fns"
import { ValidatedForm } from "remix-validated-form"
import { z } from "zod"

import { FormInput, FormDate, FormSelect, FormSubmit } from "~/components/form"
import prisma from "~/helpers/prisma.server"
import { NotFound } from "~/utils/http.server"
import {
  EventDateSchema,
  PathSchema,
  TitleSchema,
  TypeSchema,
} from "~/utils/listing"
import { json, useLoaderData } from "~/utils/remix"

const EditListingSchema = z.object({
  eventDate: EventDateSchema,
  path: PathSchema,
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

  return json(listing)
}

export default function DashboardListingPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      className="mt-8 flex flex-col sm:w-[500px] gap-y-6 m-auto"
      resetAfterSubmit
      defaultValues={{
        ...data,
      }}
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
        min={format(startOfTomorrow(), "yyyy-MM-dd")}
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
            label: "Other",
            value: ListingType.Other,
          },
        ]}
        label="Event Type"
        name="type"
        description="The type of event you're hosting"
      />
      <FormInput
        addOn="gid://shopify/Collection/"
        description="The Shopify collection ID"
        label="Commerce ID"
        name="commerceId"
      />
      <FormSubmit text="Update" loadingText="Updating..." />
    </ValidatedForm>
  )
}
