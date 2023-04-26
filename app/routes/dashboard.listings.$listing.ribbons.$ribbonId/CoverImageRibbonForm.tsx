import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm as Form } from "remix-validated-form"

import { ImageInput, Input } from "~/components/form"
import { CoverImagePropertiesSchema } from "~/utils/ribbons"

const validator = withZod(CoverImagePropertiesSchema)

export default function CoverImageRibbonForm({
  properties,
  formId,
}: {
  properties: unknown
  formId: string
}) {
  const result = CoverImagePropertiesSchema.safeParse(properties)
  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      id={formId}
      className="flex flex-col gap-2"
      method="POST"
      validator={validator}
      defaultValues={defaultValues}
      action="?/properties"
    >
      <ImageInput name="image" label="Cover Image" />
      <Input
        name="height"
        label="Height"
        type="number"
        min={0}
        step={1}
        description="The height of the cover image (in mobile view). Provide 0 to cover the whole screen"
      />
    </Form>
  )
}
