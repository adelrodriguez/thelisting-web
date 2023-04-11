import type { ActionArgs } from "@remix-run/node"
import { Form } from "@remix-run/react"

import { Input, SubmitButton } from "~/components/form"
import { clearCartQueue, createPurchaseQueue } from "~/helpers/queues"

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const orderCreatedId = formData.get("order-created") as string

  await Promise.all([
    createPurchaseQueue.add(`Manual Job - ${Date.now()}`, {
      orderId: orderCreatedId,
    }),
    clearCartQueue.add(`Manual Job - ${Date.now()}`, {
      orderId: orderCreatedId,
    }),
  ])

  return null
}

export default function DashboardAdminWebhooksPage() {
  return (
    <Form method="POST">
      <Input name="order-created" label="Order Created ID" />
      <SubmitButton>Run</SubmitButton>
    </Form>
  )
}
