import { withZod } from "@remix-validated-form/with-zod"
import { z } from "zod"

import {
  Form,
  ImageInput,
  Input,
  InputWithAddOn,
  SubmitButton,
  TextArea,
} from "~/components/form"

export const validator = withZod(
  z.object({
    customer: z.string().min(1),
    image: z.string().uuid("You must provide an image"),
    path: z.string().min(1),
    phoneNumbers: z
      .string()
      .min(1, { message: "You must provide at least one phone number" })
      .transform((value) => value.split(",")),
  }),
)

export default function WeddingGuestNotificationForm() {
  return (
    <Form className="flex flex-col gap-y-6" method="POST" validator={validator}>
      <InputWithAddOn addOn="https://thelisting.do/" label="Path" name="path" />
      <Input
        description="The name of the customer(s) (e.g. José y María)"
        label="Customer"
        name="customer"
      />
      <ImageInput
        description="The image to attach to the message"
        label="Message Image"
        name="image"
      />
      <TextArea
        description="Comma-separated list of phone numbers with country codes (e.g. 18091234567,18097654321)"
        label="Phone Numbers"
        name="phoneNumbers"
        rows={4}
      />
      <SubmitButton loadingText="Sending...">Send</SubmitButton>
    </Form>
  )
}
