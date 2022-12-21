import { z } from "zod"

import { Button } from "~/components/common"
import { Form, FormField } from "~/components/form"
import { WhatsAppMessageTemplate } from "~/config/consts"
import { logger } from "~/utils/log"

const WhatsAppBroadcastFormSchema = z.object({
  customer: z.string().min(1),
  path: z.string().min(1),
  phoneNumbers: z
    .string()
    .min(1)
    .refine((value) => value.split(",").length > 0, {
      message: "Please enter at least one phone number",
    }),
  sender: z.string().min(1),
  template: z
    .object({
      label: z.string(),
      value: z.enum([
        WhatsAppMessageTemplate.WeddingGuestNotification,
        WhatsAppMessageTemplate.BabyShowerGuestNotification,
      ]),
    })
    .nullable()
    .refine((value) => value !== null, { message: "Please select a template" }),
})

const options: Array<{ label: string; value: WhatsAppMessageTemplate }> = [
  {
    label: "Wedding Guest Notification",
    value: WhatsAppMessageTemplate.WeddingGuestNotification,
  },
  {
    label: "Baby Shower Guest Notification",
    value: WhatsAppMessageTemplate.BabyShowerGuestNotification,
  },
]

export default function WhatsAppBroadcastPage() {
  function handleSubmit(values: z.infer<typeof WhatsAppBroadcastFormSchema>) {
    const template = values.template!.value // This is safe since Zod has already validated it
    const phoneNumbers = values.phoneNumbers.split(",")

    logger.info("WhatsAppBroadcastSubmit", { phoneNumbers, template })
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="lg:text-center">
        <p className="text-base text-teal-600 font-semibold tracking-wide uppercase">
          Admin Tools
        </p>
        <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          WhatsApp Broadcast
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Send a pre-defined template message to multiple phone numbers.
        </p>
      </div>
      <div className="mt-8">
        <Form
          onSubmit={handleSubmit}
          schema={WhatsAppBroadcastFormSchema}
          defaultValues={{
            customer: "",
            path: "",
            phoneNumbers: "",
            sender: "",
            template: null,
          }}
          className="mt-6 flex flex-col sm:w-[500px] gap-y-6 m-auto"
        >
          <FormField.Select
            label="Template"
            name="template"
            options={options}
            placeholder="Select a template"
          />
          <FormField.Text
            name="customer"
            label="Customer"
            description="The name of the customer(s) (e.g. José y María)"
          />
          <FormField.Text
            name="sender"
            label="Sender"
            description="The person sending the message (e.g. Mariela)"
          />
          <FormField.Text
            name="path"
            label="Path"
            addOn="https://thelisting.do/"
          />
          <FormField.TextArea
            name="phoneNumbers"
            label="Phone Numbers"
            description="Comma-separated list of phone numbers with country codes (e.g. 18091234567,18097654321)"
          />
          <Button type="submit">Send</Button>
        </Form>
      </div>
    </div>
  )
}
