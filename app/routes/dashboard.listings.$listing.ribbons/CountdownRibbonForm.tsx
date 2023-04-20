import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { format, startOfToday } from "date-fns"
import { ValidatedForm as Form } from "remix-validated-form"

import { Input } from "~/components/form"
import { CountdownPropertiesSchema } from "~/utils/ribbons"

const validator = withZod(CountdownPropertiesSchema)

export default function BannerRibbonForm({
  ribbon,
  id,
}: {
  ribbon: Ribbon
  id: string
}) {
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
      id={id}
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="POST"
      fetcher={fetcher}
      validator={validator}
      // TODO(adelrodriguez): Fix this type error. The issue here is that an
      // input only takes strings, but our schema describes a Date object. Maybe
      // creating a custom component that can accept Date objects?
      // @ts-expect-error
      defaultValues={defaultValues}
    >
      <Input
        label="Event Date & Time"
        type="datetime-local"
        name="eventDatetime"
        required
        min={format(startOfToday(), "yyyy-MM-dd HH:mm")}
      />
    </Form>
  )
}
