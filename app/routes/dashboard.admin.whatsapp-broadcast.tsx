import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"

import { FormSubmit } from "~/components/form"
import { FormTextArea } from "~/components/form"
import { FormInput, FormSelect } from "~/components/form"
import { WHATSAPP_MESSAGE_TEMPLATES } from "~/config/consts"
import whatsapp from "~/services/whatsapp.server"

export const handle = {
  crumb: () => ({
    href: "/dashboard/admin/whatsapp-broadcast",
    name: "WhatsApp Broadcast",
  }),
}

const whatsAppBroadcastFormSchema = z.object({
  customer: z.string().min(1),
  mediaUrl: z.string().url(),
  path: z.string().min(1),
  phoneNumbers: z
    .string()
    .min(1)
    .refine((value) => value.split(",").length > 0, {
      message: "Please enter at least one phone number",
    }),
  template: z.enum(
    [
      WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification,
      WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification,
    ],
    {
      errorMap: () => ({ message: "Please select a template" }),
    }
  ),
})

const validator = withZod(whatsAppBroadcastFormSchema)

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const { data, error } = await validator.validate(formData)

  if (error) return validationError(error)

  const response = await Promise.allSettled(
    data.phoneNumbers.split(",").map(async (phoneNumber) => {
      try {
        // We are awaiting the promise here because we want to catch any errors
        return await whatsapp.sendGuestNotification(
          data.template,
          phoneNumber,
          {
            customer: data.customer,
            mediaUrl: data.mediaUrl,
            path: data.path,
          }
        )
      } catch (error) {
        return Promise.reject({
          phoneNumber,
        })
      }
    })
  )

  return json(response)
}

export default function WhatsAppBroadcastPage() {
  const data = useActionData<typeof action>()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!data) return

    if (!Array.isArray(data)) return

    data.forEach((result) => {
      if (result.status === "fulfilled") {
        enqueueSnackbar("Message sent", {
          description: `Message sent successfully to ${result.value.phoneNumber}`,
          variant: "success",
        })
      } else if (result.status === "rejected") {
        enqueueSnackbar("Error sending message", {
          description: `Error sending message to ${result.reason.phoneNumber}`,
          variant: "error",
        })
      }
    })
  }, [data, enqueueSnackbar])

  return (
    <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-teal-600">
          Admin Tools
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
          WhatsApp Broadcast
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
          Send a pre-defined template message to multiple phone numbers.
        </p>
      </div>
      <ValidatedForm
        validator={validator}
        className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
        method="POST"
      >
        <FormSelect
          label="Template"
          name="template"
          options={[
            {
              label: "Select a template",
              value: undefined,
            },
            {
              label: "Wedding Guest Notification",
              value: WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification,
            },
            {
              label: "Baby Shower Guest Notification",
              value: WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification,
            },
          ]}
          placeholder="Select a template"
          required
        />
        <FormInput name="path" label="Path" addOn="https://thelisting.do/" />
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
        <FormTextArea
          name="phoneNumbers"
          label="Phone Numbers"
          description="Comma-separated list of phone numbers with country codes (e.g. 18091234567,18097654321)"
        />
        <FormSubmit />
      </ValidatedForm>
    </div>
  )
}
