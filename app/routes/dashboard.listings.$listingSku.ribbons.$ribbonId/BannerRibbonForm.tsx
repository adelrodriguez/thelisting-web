import { type Ribbon, RibbonType } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"

import { Autocomplete, Form, ImageInput, Input, Select } from "~/components/form"
import { BannerRibbon } from "~/utils/ribbons"

const validator = withZod(BannerRibbon)

export default function BannerRibbonFields({
  fontFamilies,
  formId,
  ribbon,
}: {
  ribbon: SerializeFrom<Ribbon> // Serialized ribbon coming from loader
  formId: string
  fontFamilies: string[]
}) {
  const result = BannerRibbon.safeParse(ribbon)
  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      className="flex flex-col gap-2"
      defaultValues={defaultValues}
      id={formId}
      method="POST"
      subaction="update"
      validator={validator}
    >
      <input name="id" type="hidden" />
      <input name="type" type="hidden" value={RibbonType.Banner} />
      <input name="position" type="hidden" />

      <Input
        description="The name of the ribbon, as it will appear on the menu"
        label="Name"
        name="name"
      />

      <ImageInput label="Decoration Image" name="properties.decorationImage" />
      <Input label="Title" name="properties.title" type="text" />
      <Autocomplete
        label="Title Font"
        name="properties.titleFont"
        options={fontFamilies.map((font) => ({ label: font, value: font }))}
      />

      <Input label="Subtitle" name="properties.subtitle" type="text" />

      <ImageInput label="Background Image" name="properties.backgroundImage" />

      <div className="flex gap-2">
        <Select
          className="flex-1"
          label="Image Fit"
          name="properties.imageFit"
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
          name="properties.imagePosition"
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

      <div className="mt-4 flex flex-col gap-y-2">
        <h4 className="text-md font-semibold">Custom Styles</h4>
        <div className="flex gap-2">
          <Input
            className="flex-1"
            description="Background color for the ribbon"
            label="Background Color"
            name="styles.backgroundColor"
            type="color"
          />
          <Input
            className="flex-1"
            description="Text color for the ribbon"
            label="Text Color"
            name="styles.color"
            type="color"
          />
        </div>
      </div>
    </Form>
  )
}
