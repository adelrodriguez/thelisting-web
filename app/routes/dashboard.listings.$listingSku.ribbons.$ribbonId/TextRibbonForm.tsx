import { Ribbon, RibbonType } from "@prisma/client"
import { SerializeFrom } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { useState } from "react"

import { Form } from "~/components/form"
import {
  Checkbox,
  ImageInput,
  Input,
  Select,
  TextArea,
} from "~/components/form"
import { TextRibbon } from "~/utils/ribbons"

const validator = withZod(TextRibbon)

export default function TextRibbonForm({
  formId,
  ribbon,
}: {
  ribbon: SerializeFrom<Ribbon>
  formId: string
}) {
  let defaultValues

  const result = TextRibbon.safeParse(ribbon)

  if (result.success) {
    defaultValues = result.data
  }

  const [hasUrl, setHasUrl] = useState(defaultValues?.properties?.hasUrl)

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
      <input name="type" type="hidden" value={RibbonType.Text} />
      <input name="position" type="hidden" />

      <Input
        description="The name of the ribbon, as it will appear on the menu"
        label="Name"
        name="name"
      />

      <ImageInput label="Decoration Image" name="properties.decorationImage" />
      <Input label="Title" name="properties.title" />
      <TextArea label="Body" name="properties.body" required rows={10} />
      <Select
        label="Text Alignment"
        name="properties.textAlignment"
        options={[
          { label: "Select an option", value: "" },
          { label: "Left", value: "text-left" },
          { label: "Center", value: "text-center" },
          { label: "Right", value: "text-right" },
          { label: "Justify", value: "text-justify" },
        ]}
      />
      <Checkbox
        description="Show a clickable button with a link"
        label="Has URL"
        name="properties.hasUrl"
        onChange={(e) => {
          setHasUrl(e.target.checked)
        }}
        value="true"
      />
      {hasUrl && (
        <>
          <Input label="URL" name="properties.url" />
          <Input label="Label" name="properties.urlLabel" />
        </>
      )}

      <div className="mt-4 flex flex-col gap-y-2">
        <h4 className="text-md font-semibold">Custom Styles</h4>
        <div className="flex gap-2">
          <Input
            className="flex-1"
            description="The height of the ribbon"
            label="Height"
            min={0}
            name="styles.height"
            step={1}
            trailing="px"
            type="number"
          />
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
