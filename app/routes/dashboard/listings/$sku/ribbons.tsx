import { RibbonType } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { notFound } from "remix-utils"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"

import { FormImageUpload, FormInput, FormSubmit } from "~/components/form"
import prisma from "~/helpers/prisma.server"
import {
  generateCloudflareImageUrl,
  uploadImageToCloudflare,
} from "~/utils/cloudflare.server"
import { json, useLoaderData } from "~/utils/remix"
import { BannerPropertiesSchema } from "~/utils/ribbon"

export const handle = {
  id: "dashboard-listings-ribbons",
}

const EditRibbonSchema = z.object({
  name: z.string().min(1).max(255),
  properties: BannerPropertiesSchema,
})

const validator = withZod(EditRibbonSchema)

export async function loader({ params }: LoaderArgs) {
  const sku = params.sku

  if (!sku) throw notFound("Listing not found")

  if (isNaN(Number(sku))) throw notFound("Listing not found")

  const ribbons = await prisma.ribbon.findMany({
    where: { listing: { sku: Number(sku) } },
  })

  return json({
    ribbons,
    ...ribbons.reduce((acc, curr) => {
      return { ...acc, ...setFormDefaults(curr.id, curr) }
    }, {}),
  })
}

export async function action({ request }: ActionArgs) {
  const uploadHandler = composeUploadHandlers(
    async ({ name, data, filename }) => {
      if (name !== "properties.backgroundImage") {
        return undefined
      }

      const { result } = await uploadImageToCloudflare(data, filename)

      return generateCloudflareImageUrl(result.id)
    },
    createMemoryUploadHandler()
  )

  const formData = await parseMultipartFormData(request, uploadHandler)

  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  const formId = result.formId
  const { properties } = result.data

  const ribbon = await prisma.ribbon.update({
    data: {
      properties,
    },
    where: { id: formId },
  })

  return ribbon
}

export default function DashboardListingRibbonsPage() {
  const { ribbons } = useLoaderData<typeof loader>()

  return (
    <div className="mt-4">
      {ribbons.map((ribbon) => (
        <div key={ribbon.id}>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Banner
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  This banner is the first thing section people see when they
                  visit a Listing.
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <ValidatedForm
                id={ribbon.id}
                key={ribbon.id}
                validator={validator}
                method="post"
                encType="multipart/form-data"
              >
                <div className="shadow sm:overflow-hidden sm:rounded-md">
                  <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <FormInput
                        name="position"
                        label="Position"
                        required
                        type="number"
                        disabled={ribbon.type === RibbonType.Banner}
                        className="col-span-1"
                      />
                      <FormInput
                        name="name"
                        label="Name"
                        required
                        className="col-span-5"
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormInput name="properties.title" label="Title" />
                      <FormInput name="properties.subtitle" label="Subtitle" />
                      <FormImageUpload
                        name="properties.backgroundImage"
                        label="Background Image"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <FormSubmit text="Save" loadingText="Saving..." />
                  </div>
                </div>
              </ValidatedForm>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
