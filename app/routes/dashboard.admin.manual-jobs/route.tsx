import type { ActionFunctionArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { z } from "zod"

import { TextArea, SubmitButton, Form, Select } from "~/components/form"
import { QUEUE_NAMES } from "~/config/consts"
import { unprocessableEntity } from "~/utils/remix"

// TODO(adelrodriguez): Improve this schema
export const validator = withZod(
  z.object({
    payload: z.string().transform((value) => JSON.parse(value)),
    queue: z.string().refine(
      (value) => {
        return Object.values(QUEUE_NAMES).includes(value)
      },
      { message: "Invalid queue" },
    ),
  }),
)

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) {
    return unprocessableEntity({
      ...result.error,
      response: null,
      success: false,
    })
  }

  return null
}

export default function DashboardAdminWebhooksPage() {
  return (
    <Form validator={validator}>
      <Select
        label="Queue"
        name="queue"
        options={Object.values(QUEUE_NAMES).map((queue) => ({
          label: queue,
          value: queue,
        }))}
        placeholder="Select a queue"
      />
      <TextArea label="Payload" name="payload" />
      <SubmitButton disabled>TODO</SubmitButton>
    </Form>
  )
}
