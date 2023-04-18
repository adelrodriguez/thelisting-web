import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm as Form } from "remix-validated-form"
import { z } from "zod"

import { ImageInput, Input } from "~/components/form"
import { CoverImagePropertiesSchema } from "~/utils/ribbons"

const validator = withZod(
  z.object({
    height: z.coerce
      .number()
      .min(0, "Height must be greater than 0")
      .int("Height must be an integer")
      .optional(),
    image: z.string().uuid("You must provide an image"),
  })
)

export default function CoverImageRibbonForm({
  ribbon,
  id,
}: {
  ribbon: Ribbon
  id: string
}) {
  const fetcher = useFetcher()
  const result = CoverImagePropertiesSchema.safeParse(ribbon.properties)
  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      id={id}
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="post"
      validator={validator}
      defaultValues={defaultValues}
      fetcher={fetcher}
    >
      <ImageInput name="image" label="Cover Image" />
      <Input
        name="height"
        label="Height"
        type="number"
        min="0"
        step="1"
        description="The height of the cover image (in mobile view). Provide 0 to cover the whole screen"
      />
    </Form>
  )
}
