import { withZod } from "@remix-validated-form/with-zod"

import { Form, Input, TextArea } from "~/components/form"
import { LocationPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(LocationPropertiesSchema)

export default function LocationRibbonForm({
  properties,
  formId,
}: {
  properties: unknown
  formId: string
}) {
  const result = LocationPropertiesSchema.safeParse(properties)

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
      <Input label="Caption" name="caption" />
      <TextArea label="Address" name="address" rows={2} />
    </Form>
  )
}
