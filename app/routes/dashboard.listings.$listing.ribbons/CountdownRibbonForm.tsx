import type { Ribbon } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { format, startOfToday } from "date-fns"

import { Input, SubmitButton } from "~/components/form"
import {
  CountdownEventDatetimeSchema,
  CountdownPropertiesSchema,
} from "~/utils/ribbon"

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
    <fetcher.Form
      className="flex flex-col gap-2"
      action={`/api/ribbons/${ribbon.id}/properties`}
      method="post"
    >
      <Input
        label="Event Date & Time"
        type="datetime-local"
        name="eventDatetime"
        defaultValue={defaultValues?.eventDatetime}
        required
        schema={CountdownEventDatetimeSchema}
        min={format(startOfToday(), "yyyy-MM-dd HH:mm")}
      />
      <SubmitButton>Save</SubmitButton>
    </fetcher.Form>
  )
}
