import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm as Form } from "remix-validated-form"
import { z } from "zod"

import { ImageInput, SubmitButton } from "~/components/form"
import { CoverImagePropertiesSchema } from "~/utils/ribbons"

const validator = withZod(
  z.object({
    image: z.string().uuid("You must provide an image"),
  })
)

export default function CoverImageRibbonForm({ ribbon }: { ribbon: Ribbon }) {
  const fetcher = useFetcher()
  const result = CoverImagePropertiesSchema.safeParse(ribbon.properties)
  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="post"
      validator={validator}
      defaultValues={defaultValues}
      fetcher={fetcher}
      resetAfterSubmit
    >
      <ImageInput name="image" label="Cover Image" />
      <SubmitButton loadingText="Updating...">Update</SubmitButton>
    </Form>
  )
}
