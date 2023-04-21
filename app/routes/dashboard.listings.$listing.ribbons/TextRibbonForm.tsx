import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm as Form } from "remix-validated-form"

import { ImageInput, Input, Select, TextArea } from "~/components/form"
import { TextPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(TextPropertiesSchema)

export default function TextRibbonForm({
  ribbon,
  id,
}: {
  ribbon: Ribbon
  id: string
}) {
  const fetcher = useFetcher()
  const result = TextPropertiesSchema.safeParse(ribbon.properties)
  let defaultValues

  if (result.success) {
    defaultValues = result.data
  }

  return (
    <Form
      id={id}
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="post"
      validator={validator}
      defaultValues={defaultValues}
      fetcher={fetcher}
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
    </Form>
  )
}
