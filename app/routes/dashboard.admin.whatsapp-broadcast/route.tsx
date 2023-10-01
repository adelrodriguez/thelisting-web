import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { StatusCodes } from "http-status-codes"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import { ValidatedForm } from "remix-validated-form"
import { z } from "zod"

import {
  ImageInput,
  Input,
  InputWithAddOn,
  Select,
  SubmitButton,
  TextArea,
} from "~/components/form"
import { SendWhatsAppTemplateMessageQueue } from "~/helpers/queues"
import { WHATSAPP_MESSAGE_TEMPLATES } from "~/services/whatsapp/types"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"

export const handle = {
  crumb: () => ({
    href: "/dashboard/admin/whatsapp-broadcast",
    name: "WhatsApp Broadcast",
  }),
}

const validator = withZod(
  z.object({
    customer: z.string().min(1),
    image: z.string().uuid("You must provide an image"),
    path: z.string().min(1),
    phoneNumbers: z
      .string()
      .min(1, { message: "You must provide at least one phone number" })
      .transform((value) => value.split(",")),
    template: z.enum(
      [
        WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification,
        WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification,
      ],
      {
        errorMap: () => ({ message: "Please select a template" }),
      },
    ),
  }),
)

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) {
    return json({ ...result.error, response: null, success: false } as const, {
      status: StatusCodes.UNPROCESSABLE_ENTITY,
    })
  }

  switch (result.data.template) {
    case WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification:
    case WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification:
      await SendWhatsAppTemplateMessageQueue.addBulk(
        result.data.phoneNumbers.map((phoneNumber) => ({
          data: {
            locale: "ES",
            payload: {
              imageUrl: generateCloudflareImageUrl(result.data.image, "public"),
              path: result.data.path,
              recipient: result.data.customer,
            },
            template: result.data.template,
            to: phoneNumber,
          },
          name: phoneNumber,
        })),
      )
      break
    default:
      throw new Error("Invalid template")
  }

  return json({
    amount: result.data.phoneNumbers.length,
    success: true,
  } as const)
}

export default function WhatsAppBroadcastPage() {
  const actionData = useActionData<typeof action>()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!actionData) return

    if (actionData.success) {
      enqueueSnackbar("Message enqueued", {
        description: `Messages enqueue to be sent to ${actionData.amount} phone numbers. Check the job queue for status.`,
        variant: "success",
      })
    } else {
      enqueueSnackbar("Error sending messages", {
        description: "Error sending messages",
        variant: "error",
      })
    }
  }, [actionData, enqueueSnackbar])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
        className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
        id="whatsapp-broadcast"
        method="POST"
        validator={validator}
      >
        <Select
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
        <InputWithAddOn
          addOn="https://thelisting.do/"
          label="Path"
          name="path"
        />
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
      </ValidatedForm>
    </div>
  )
}
