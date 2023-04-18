import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm as Form } from "remix-validated-form"
import { z } from "zod"
import { zfd } from "zod-form-data"

import { ImageInput, Input, SubmitButton } from "~/components/form"
import { BannerPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(
  z.object({
    backgroundImage: zfd.text(z.string().optional()),
    subtitle: zfd.text(z.string().optional()),
    title: z
      .string()
      .min(1, "You must provide a title for the banner")
      .max(255),
  })
)

export default function BannerRibbonForm({ ribbon }: { ribbon: Ribbon }) {
  const fetcher = useFetcher()
  const result = BannerPropertiesSchema.safeParse(ribbon.properties)
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
    >
      <Input label="Title" type="text" name="title" required />
      <Input label="Subtitle" type="text" name="subtitle" />
      <ImageInput name="backgroundImage" label="Background Image" />
      <SubmitButton loadingText="Updating...">Update</SubmitButton>
    </Form>
  )
}
