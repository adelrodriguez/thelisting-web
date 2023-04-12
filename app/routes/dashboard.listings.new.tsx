import { ListingType } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { startOfTomorrow } from "date-fns"
import { useSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { unauthorized } from "remix-utils"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"

import { FormDate, FormInput, FormSelect, FormSubmit } from "~/components/form"
import auth from "~/helpers/auth.server"
import { CreateListingCommerceEntityQueue } from "~/helpers/queues"
import { getFormData } from "~/utils/http.server"
import {
  EventDateSchema,
  PathSchema,
  TitleSchema,
  TypeSchema,
  verifyPathIsUnique,
} from "~/utils/listing"
import { json, redirect, useLoaderData } from "~/utils/remix"
import { getUserFullName } from "~/utils/user"
import { isWindowDefined } from "~/utils/window"

export const handle = {
  crumb: () => ({
    href: `/dashboard/listings/new/`,
    name: "New Listing",
  }),
}

const CreateListingSchema = z.object({
  eventDate: EventDateSchema,
  ownerId: z.string().uuid(),
  path: PathSchema,
  title: TitleSchema,
  type: TypeSchema,
})

const validator = withZod(CreateListingSchema)

export async function loader({ request, context }: LoaderArgs) {
  const { db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) throw unauthorized("You must be logged in to create a listing")

  const users = await db.user.findMany({
    orderBy: { firstName: "asc" },
    select: { firstName: true, id: true, lastName: true },
  })

  return json({
    users,
    ...setFormDefaults("createListing", {
      eventDate: startOfTomorrow(),
      ownerId: user.id,
      path: "",
      title: "",
      type: undefined,
    }),
  })
}

export async function action({ request, context }: ActionArgs) {
  const { db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) throw unauthorized("You must be logged in to create a listing")

  const serverValidator = withZod(
    CreateListingSchema.refine(
      async (data) => {
        const result = await verifyPathIsUnique(data.path)
        return result
      },
      {
        message: "This path is already taken",
        path: ["path"],
      }
    )
  )

  const formData = await getFormData(request)

  const result = await serverValidator.validate(formData)

  if (result.error) return validationError(result.error)

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
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (isWindowDefined()) {
      setOrigin(window.location.origin)
    }
  }, [])

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
        id="createListing"
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
        />
        <FormSelect
          options={users.map((user) => ({
            label: getUserFullName(user),
            value: user.id,
          }))}
          label="Owner"
          name="ownerId"
          description="The owner of this listing"
        />

        <FormSubmit text="Create" loadingText="Creating..." />
      </ValidatedForm>
    </div>
  )
}
