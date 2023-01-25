import { ListingType } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { startOfToday, format, startOfTomorrow } from "date-fns"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"

import { FormDate, FormInput, FormSelect, FormSubmit } from "~/components/form"
import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import { getFormData, Unauthorized } from "~/utils/http.server"
import { redirect } from "~/utils/remix"

const createListingSchema = z.object({
  eventDate: z
    .string()
    .transform((value) => new Date(value))
    .refine((value) => value > startOfToday(), {
      message: "Event date must be in the future",
    }),
  path: z
    .string()
    .min(1)
    .trim()
    .transform((value) => value.toLowerCase())
    .transform((value) => value.replace(/[^a-z0-9]/g, "-"))
    .transform((value) => value.replace(/-+/g, "-"))
    .transform((value) => value.replace(/^-|-$/g, "")),
  title: z.string().min(1),
  type: z.enum(
    [ListingType.BabyShower, ListingType.Wedding, ListingType.Birthday],
    {
      errorMap: () => ({ message: "Please select a type of event" }),
    }
  ),
})

const validator = withZod(createListingSchema)

export async function action({ request }: ActionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) throw Unauthorized

  const createListingWithPathValidation = createListingSchema.refine(
    async (data) => {
      const listing = await prisma.listing.findUnique({
        select: { id: true },
        where: {
          path: data.path,
        },
      })

      return !listing
    },
    {
      message: "This path is already taken",
      path: ["path"],
    }
  )

  const serverValidator = withZod(createListingWithPathValidation)
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

  return redirect(`/dashboard/listings/${listing.path}`)
}

export default function CreateListingsPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="lg:text-center">
        <p className="text-base text-gray-600 font-semibold tracking-wide uppercase">
          Listings
        </p>
        <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Create a new listing
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Create a new listing for your event
        </p>
      </div>
      <ValidatedForm
        validator={validator}
        method="post"
        className="mt-8 flex flex-col sm:w-[500px] gap-y-6 m-auto"
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
              label: "Wedding",
              value: ListingType.Wedding,
            },
            {
              label: "Baby Shower",
              value: ListingType.BabyShower,
            },
            {
              label: "Birthday",
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
        <FormSubmit text="Create" loadingText="Creating..." />
      </ValidatedForm>
    </div>
  )
}
