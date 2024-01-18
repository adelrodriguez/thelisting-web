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
      <Input
        description="The height of the cover image (in mobile view). Provide 0 to cover the whole screen"
        label="Height"
        min={0}
        name="properties.height"
        step={1}
        type="number"
      />
    </Form>
  )
}
