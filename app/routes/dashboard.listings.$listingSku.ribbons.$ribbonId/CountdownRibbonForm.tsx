import { Ribbon, RibbonType } from "@prisma/client"
import { SerializeFrom } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { format, startOfToday } from "date-fns"

import { Form } from "~/components/form"
import { Input } from "~/components/form"
import { CountdownRibbon } from "~/utils/ribbons"

const validator = withZod(CountdownRibbon)

export default function CountdownRibbonForm({
  formId,
  ribbon,
}: {
  ribbon: SerializeFrom<Ribbon> // Serialized ribbon coming from loader
  formId: string
}) {
  const result = CountdownRibbon.safeParse(ribbon)
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
      <input name="type" type="hidden" value={RibbonType.Countdown} />
      <input name="position" type="hidden" />

      <Input
        description="The name of the ribbon, as it will appear on the menu"
        label="Name"
        name="name"
      />

      <Input
        label="Event Date & Time"
        min={format(startOfToday(), "yyyy-MM-dd HH:mm")}
        name="properties.eventDatetime"
        required
        type="datetime-local"
      />
    </Form>
  )
}
