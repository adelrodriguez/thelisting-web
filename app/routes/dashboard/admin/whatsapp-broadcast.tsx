import type { ActionArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"

import { Button } from "~/components/common"
import type { SelectOption } from "~/components/form"
import { FormTextArea } from "~/components/form"
import { FormInput, FormSelect } from "~/components/form"
import { WhatsAppMessageTemplate } from "~/config/consts"
import {
  META_GRAPH_API_USER_ACCESS_TOKEN,
  META_GRAPH_API_VERSION,
  WHATSAPP_PHONE_NUMBER_ID,
} from "~/config/env.server"
import { getFormData } from "~/utils/http.server"
import { logger } from "~/utils/log"

const WhatsAppBroadcastFormSchema = z.object({
  customer: z.string().min(1),
  mediaUrl: z.string().url(),
  path: z.string().min(1),
  phoneNumbers: z
    .string()
    .min(1)
    .refine((value) => value.split(",").length > 0, {
      message: "Please enter at least one phone number",
    }),
  sender: z.string().min(1),
  template: z.enum(
    [
      WhatsAppMessageTemplate.BabyShowerGuestNotification,
      WhatsAppMessageTemplate.WeddingGuestNotification,
    ],
    {
      errorMap: () => ({ message: "Please select a template" }),
    }
  ),
})

const validator = withZod(WhatsAppBroadcastFormSchema)

const options: Array<SelectOption<WhatsAppMessageTemplate | undefined>> = [
  {
    label: "Select a template",
    value: undefined,
  },
  {
    label: "Wedding Guest Notification",
    value: WhatsAppMessageTemplate.WeddingGuestNotification,
  },
  {
    disabled: true,
    label: "Baby Shower Guest Notification",
    value: WhatsAppMessageTemplate.BabyShowerGuestNotification,
  },
]

export async function action({ request }: ActionArgs) {
  const formData = await getFormData(request)
  const { data, error } = await validator.validate(formData)

  if (error) return validationError(error)

  // TODO(adelrodriguez): Move this into the WhatsApp service
  await Promise.all(
    data.phoneNumbers.split(",").map(async (phoneNumber) => {
      const body = {
        messaging_product: "whatsapp",
        template: {
          components: [
            {
              parameters: [
                {
                  image: {
                    link: data.mediaUrl,
                  },
                  type: "image",
                },
              ],
              type: "header",
            },
            {
              parameters: [
                {
                  text: data.path,
                  type: "text",
                },
                {
                  text: data.customer,
                  type: "text",
                },
                {
                  text: data.sender,
                  type: "text",
                },
              ],
              type: "body",
            },
            {
              index: "0",
              parameters: [
                {
                  text: data.path,
                  type: "text",
                },
              ],
              sub_type: "url",
              type: "button",
            },
          ],
          language: {
            code: "es",
          },
          name: "wedding_registry_guest_notification_test",
        },
        to: phoneNumber,
        type: "template",
      }

      try {
        const res = await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            body: JSON.stringify(body),
            headers: {
              Authorization: "Bearer " + META_GRAPH_API_USER_ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        )
        logger.info("Broadcast Response:", { res })
      } catch (error) {
        logger.error((error as Error).message)
      }
    })
  )

  return null
}

export default function WhatsAppBroadcastPage() {
  // TODO(adelrodriguez): Add a success message
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
        <ValidatedForm
          validator={validator}
          className="mt-6 flex flex-col sm:w-[500px] gap-y-6 m-auto"
          method="post"
          resetAfterSubmit
        >
          <FormSelect
            label="Template"
            name="template"
            options={options}
            placeholder="Select a template"
            required
          />
          <FormInput
            name="customer"
            label="Customer"
            description="The name of the customer(s) (e.g. José y María)"
          />
          <FormInput
            name="mediaUrl"
            label="Media URL"
            description="The URL to the media to attach to the message"
          />
          <FormInput
            name="sender"
            label="Sender"
            description="The person sending the message (e.g. Mariela)"
          />
          <FormInput name="path" label="Path" addOn="https://thelisting.do/" />
          <FormTextArea
            name="phoneNumbers"
            label="Phone Numbers"
            description="Comma-separated list of phone numbers with country codes (e.g. 18091234567,18097654321)"
          />
          <Button type="submit">Send</Button>
        </ValidatedForm>
      </div>
    </div>
  )
}
