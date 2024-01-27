import { Ribbon, RibbonType } from "@prisma/client"
import { SerializeFrom } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"

import { Form } from "~/components/form"
import { ImageInput, Input } from "~/components/form"
import { CoverImageRibbon } from "~/utils/ribbons"

const validator = withZod(CoverImageRibbon)

export default function CoverImageRibbonForm({
  formId,
  ribbon,
}: {
  ribbon: SerializeFrom<Ribbon> // Serialized ribbon coming from loader
  formId: string
}) {
  const result = CoverImageRibbon.safeParse(ribbon)
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
      <input name="type" type="hidden" value={RibbonType.CoverImage} />
      <input name="position" type="hidden" />

      <Input
        description="The name of the ribbon, as it will appear on the menu"
        label="Name"
        name="name"
      />

      <ImageInput label="Cover Image" name="properties.image" />

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
