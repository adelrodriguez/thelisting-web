import { type Ribbon, RibbonType } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"

import { Form, Input, TextArea } from "~/components/form"
import { LocationRibbon } from "~/utils/ribbons"

const validator = withZod(LocationRibbon)

export default function LocationRibbonForm({
  formId,
  ribbon,
}: {
  ribbon: SerializeFrom<Ribbon> // Serialized ribbon coming from loader
  formId: string
}) {
  const result = LocationRibbon.safeParse(ribbon)

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
      <input name="type" type="hidden" value={RibbonType.Location} />
      <input name="position" type="hidden" />

      <Input
        description="The name of the ribbon, as it will appear on the menu"
        label="Name"
        name="name"
      />

      <TextArea label="Address" name="properties.address" rows={2} />
      <Input label="Caption" name="properties.caption" />
      <div className="grid grid-cols-2 gap-2">
        <Input
          description="The height of the ribbon"
          label="Height"
          min={0}
          name="properties.height"
          step={1}
          trailing="px"
          type="number"
        />
        <Input
          description="How zoomed in should the location appear on the map"
          label="Zoom Level"
          name="properties.zoom"
          type="number"
        />
      </div>

      <div className="mt-4 flex flex-col gap-y-2">
        <h4 className="text-md font-semibold">Custom Styles</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Padding Top"
            min={0}
            name="styles.paddingTop"
            step={1}
            trailing="px"
            type="number"
          />
          <Input
            className="flex-1"
            label="Padding Bottom"
            min={0}
            name="styles.paddingBottom"
            step={1}
            trailing="px"
            type="number"
          />
          <Input
            description="Background color for the ribbon"
            label="Background Color"
            name="styles.backgroundColor"
            type="color"
          />
          <Input
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
