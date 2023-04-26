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
      id={formId}
      className="flex flex-col gap-2"
      method="POST"
      validator={validator}
      defaultValues={defaultValues}
      action="?/properties"
    >
      <ImageInput name="decorationImage" label="Decoration Image" />
      <Input label="Title" type="text" name="title" required />
      <Input label="Subtitle" type="text" name="subtitle" />
      <ImageInput name="backgroundImage" label="Background Image" />
      <div className="flex gap-2">
        <Select
          name="imageFit"
          label="Image Fit"
          options={[
            { label: "Select an option", value: "" },
            { label: "Contain", value: "object-contain" },
            { label: "Cover", value: "object-cover" },
            { label: "Fill", value: "object-fill" },
            { label: "None", value: "object-none" },
            { label: "Scale Down", value: "object-scale-down" },
          ]}
          className="flex-1"
        />
        <Select
          name="imagePosition"
          label="Image Position"
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
          className="flex-1"
        />
      </div>
    </Form>
  )
}
