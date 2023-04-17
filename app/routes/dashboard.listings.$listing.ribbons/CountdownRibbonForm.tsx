import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { format, startOfToday } from "date-fns"
import { ValidatedForm as Form } from "remix-validated-form"
import { z } from "zod"
import { zfd } from "zod-form-data"

import { Input, SubmitButton } from "~/components/form"
import { CountdownPropertiesSchema } from "~/utils/ribbon"

const validator = withZod(
  zfd.formData({
    eventDatetime: z.string(),
  })
)

export default function BannerRibbonForm({ ribbon }: { ribbon: Ribbon }) {
  const fetcher = useFetcher()
  const result = CountdownPropertiesSchema.safeParse(ribbon.properties)
  let defaultValues

  if (result.success) {
    defaultValues = {
      eventDatetime: format(result.data.eventDatetime, "yyyy-MM-dd HH:mm"),
    }
  }

  return (
    <Form
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="POST"
      fetcher={fetcher}
      validator={validator}
      defaultValues={defaultValues}
    >
      <Input
        label="Event Date & Time"
        type="datetime-local"
        name="eventDatetime"
        required
        min={format(startOfToday(), "yyyy-MM-dd HH:mm")}
      />
      <SubmitButton>Save</SubmitButton>
    </Form>
  )
}
