import { MinusIcon } from "@heroicons/react/20/solid"
import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import {
  useFieldArray,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"

import { Button } from "~/components/common"
import {
  ImageInput,
  Input,
  InputWithAddOn,
  Select,
  SubmitButton,
} from "~/components/form"
import { WHATSAPP_MESSAGE_TEMPLATES } from "~/config/consts"
import whatsapp from "~/services/whatsapp.server"
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
      .array(z.string())
      .min(1, { message: "Please add a number" }),

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
)

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const { data, error } = await validator.validate(formData)

  if (error) return validationError(error)

  const response = await Promise.allSettled(
    data.phoneNumbers.map(async (phoneNumber) => {
      try {
        // We are awaiting the promise here because we want to catch any errors
        return await whatsapp.sendGuestNotification(
          data.template,
          phoneNumber,
          {
            customer: data.customer,
            mediaUrl: generateCloudflareImageUrl(data.image, "public"),
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
  const [inputs, { push, remove }] = useFieldArray("phoneNumbers", {
    formId: "whatsapp-broadcast",
  })

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
        id="whatsapp-broadcast"
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
          name="path"
          label="Path"
          addOn="https://thelisting.do/"
        />
        <Input
          name="customer"
          label="Customer"
          description="The name of the customer(s) (e.g. José y María)"
        />
        <ImageInput
          name="image"
          label="Message Image"
          description="The image to attach to the message"
        />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">Phone Numbers</h3>
            <p className="text-xs">
              The phone number to send the message to, including the country
              code (e.g. +18091234567)
            </p>
          </div>

          <Button
            onClick={() => push("")}
            type="button"
            size="xs"
            variant="secondary"
          >
            Add a number
          </Button>
        </div>
        <div className="flex flex-col gap-y-2">
          {inputs.map((_, index) => (
            <div key={`inputs${index}`} className="flex w-full items-end">
              <Input
                name={`phoneNumbers[${index}]`}
                label={`Phone Number ${index + 1}`}
                className="mr-2 w-full"
              />
              <Button
                onClick={() => remove(index)}
                className="my-1"
                variant="secondary"
                type="button"
              >
                <MinusIcon className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
        <SubmitButton loadingText="Sending...">Send</SubmitButton>
      </ValidatedForm>
    </div>
  )
}
