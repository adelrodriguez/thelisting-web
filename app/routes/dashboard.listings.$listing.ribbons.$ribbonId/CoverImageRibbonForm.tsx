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
      action="?/properties"
      className="flex flex-col gap-2"
      defaultValues={defaultValues}
      id={formId}
      method="POST"
      validator={validator}
    >
      <ImageInput label="Cover Image" name="image" />
      <Input
        description="The height of the cover image (in mobile view). Provide 0 to cover the whole screen"
        label="Height"
        min={0}
        name="height"
        step={1}
        type="number"
      />
    </Form>
  )
}
