import { type Ribbon, RibbonType } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"

import { Form, Input } from "~/components/form"
import { EmbeddedRibbon } from "~/utils/ribbons"

const validator = withZod(EmbeddedRibbon)

export default function EmbeddedRibbonForm({
  formId,
  ribbon,
}: {
  ribbon: SerializeFrom<Ribbon> // Serialized ribbon coming from loader
  formId: string
}) {
  const result = EmbeddedRibbon.safeParse(ribbon)

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
      <input name="type" type="hidden" value={RibbonType.Embedded} />
      <input name="position" type="hidden" />

      <Input
        description="The name of the ribbon, as it will appear on the menu"
        label="Name"
        name="name"
      />

      <Input description="The title of the embed" label="Title" name="properties.title" />
      <Input description="The URL for the iframe" label="URL" name="properties.url" />
      <Input
        description="The height of the ribbon"
        label="Height"
        min={0}
        name="properties.height"
        type="number"
      />

      <div className="mt-4 flex flex-col gap-y-2">
        <h4 className="text-md font-semibold">Custom Styles</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Top Padding"
            min={0}
            name="styles.paddingTop"
            step={1}
            trailing="px"
            type="number"
          />
          <Input
            label="Bottom Padding"
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
