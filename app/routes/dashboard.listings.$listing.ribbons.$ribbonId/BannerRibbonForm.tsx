import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm as Form } from "remix-validated-form"

import { ImageInput, Input, Select } from "~/components/form"
import { BannerPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(BannerPropertiesSchema)

export default function BannerRibbonFields({
  properties,
  formId,
}: {
  properties: unknown
  formId: string
}) {
  const result = BannerPropertiesSchema.safeParse(properties)
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
      <ImageInput label="Decoration Image" name="decorationImage" />
      <Input label="Title" name="title" required type="text" />
      <Input label="Subtitle" name="subtitle" type="text" />
      <ImageInput label="Background Image" name="backgroundImage" />
      <div className="flex gap-2">
        <Select
          className="flex-1"
          label="Image Fit"
          name="imageFit"
          options={[
            { label: "Select an option", value: "" },
            { label: "Contain", value: "object-contain" },
            { label: "Cover", value: "object-cover" },
            { label: "Fill", value: "object-fill" },
            { label: "None", value: "object-none" },
            { label: "Scale Down", value: "object-scale-down" },
          ]}
        />
        <Select
          className="flex-1"
          label="Image Position"
          name="imagePosition"
          options={[
            { label: "Select an option", value: "" },
            { label: "Bottom", value: "object-bottom" },
            { label: "Center", value: "object-center" },
            { label: "Left", value: "object-left" },
            { label: "Left Bottom", value: "object-left-bottom" },
            { label: "Left Top", value: "object-left-top" },
            { label: "Right", value: "object-right" },
            { label: "Right Bottom", value: "object-right-bottom" },
            { label: "Right Top", value: "object-right-top" },
            { label: "Top", value: "object-top" },
          ]}
        />
      </div>
    </Form>
  )
}
