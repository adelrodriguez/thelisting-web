import { ListingType } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { startOfTomorrow } from "date-fns"
import { useSnackbar } from "notistack"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"

import { FormDate, FormInput, FormSelect, FormSubmit } from "~/components/form"
import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import { createListingCommerceEntityQueue } from "~/helpers/queues"
import { getFormData, Unauthorized } from "~/utils/http.server"
import {
  EventDateSchema,
  PathSchema,
  TitleSchema,
  TypeSchema,
  verifyPathIsUnique,
} from "~/utils/listing"
import { redirect } from "~/utils/remix"

const CreateListingSchema = z.object({
  eventDate: EventDateSchema,
  path: PathSchema,
  title: TitleSchema,
  type: TypeSchema,
})

const validator = withZod(CreateListingSchema)

export async function action({ request }: ActionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) throw Unauthorized

  const CreateListingSchemaWithUniquePath = CreateListingSchema.refine(
    async (data) => {
      const result = await verifyPathIsUnique(data.path)
      return result
    },
    {
      message: "This path is already taken",
      path: ["path"],
    }
  )

  const serverValidator = withZod(CreateListingSchemaWithUniquePath)
  const formData = await getFormData(request)

  const result = await serverValidator.validate(formData)

  if (result.error) return validationError(result.error)

  const listing = await prisma.listing.create({
    data: {
      eventDate: result.data.eventDate,
      ownerId: user.id,
      path: result.data.path,
      title: result.data.title,
      type: result.data.type,
    },
  })

  await createListingCommerceEntityQueue.add(`${listing.sku}`, {
    listingId: listing.id,
  })

  return redirect("/dashboard/listings/")
}

export default function CreateListingsPage() {
  const { enqueueSnackbar } = useSnackbar()
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
      <ValidatedForm
        validator={validator}
        method="post"
        className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
        resetAfterSubmit
        onSubmit={() => {
          enqueueSnackbar("Listing created 🎉", {
            description:
              "The listing was successfully created. The Shopify collection will be created shortly.",
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
          name="path"
          label="Path"
          addOn="https://thelisting.do/"
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

        <FormSubmit text="Create" loadingText="Creating..." />
      </ValidatedForm>
    </div>
  )
}
