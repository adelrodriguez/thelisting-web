import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm as Form } from "remix-validated-form"

import { ImageInput, Input } from "~/components/form"
import { BannerPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(BannerPropertiesSchema)

export default function BannerRibbonForm({
  ribbon,
  id,
}: {
  ribbon: Ribbon
  id: string
}) {
  const fetcher = useFetcher()
  const result = BannerPropertiesSchema.safeParse(ribbon.properties)
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
      <Input label="Title" type="text" name="title" required />
      <Input label="Subtitle" type="text" name="subtitle" />
      <ImageInput name="backgroundImage" label="Background Image" />
    </Form>
  )
}
