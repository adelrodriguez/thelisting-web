import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { ValidatedForm as Form } from "remix-validated-form"

import {
  Checkbox,
  ImageInput,
  Input,
  Select,
  TextArea,
} from "~/components/form"
import { TextPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(TextPropertiesSchema)

export default function TextRibbonForm({
  properties,
  formId,
}: {
  properties: unknown
  formId: string
}) {
  let defaultValues

  const result = TextPropertiesSchema.safeParse(properties)
  const [hasUrl, setHasUrl] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  if (result.success) {
    defaultValues = result.data
  }

  useEffect(() => {
    if (result.success) {
      setHasUrl(!!result.data.hasUrl)
    } else {
      enqueueSnackbar("Unable to parse ribbon properties", {
        description: JSON.stringify(result.error.flatten().fieldErrors),
        variant: "error",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <Input label="Title" name="title" />
      <TextArea label="Body" name="body" required rows={10} />
      <Select
        label="Text Alignment"
        name="textAlignment"
        options={[
          { label: "Select an option", value: "" },
          { label: "Left", value: "text-left" },
          { label: "Center", value: "text-center" },
          { label: "Right", value: "text-right" },
          { label: "Justify", value: "text-justify" },
        ]}
      />
      <Checkbox
        label="Has URL"
        name="hasUrl"
        description="Show a clickable button with a link"
        onChange={(e) => setHasUrl(e.target.checked)}
        value="true"
      />
      {hasUrl && (
        <>
          <Input label="URL" name="url" />
          <Input label="Label" name="urlLabel" />
        </>
      )}
    </Form>
  )
}
