import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData, useSearchParams } from "@remix-run/react"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { CardRadioGroup } from "~/components/common"
import { SendWhatsAppTemplateMessageQueue } from "~/helpers/queues"
import { WHATSAPP_MESSAGE_TEMPLATES } from "~/services/whatsapp/types"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import { unprocessableEntity } from "~/utils/http"
import type { RouteHandle } from "~/utils/remix"

import BabyShowerGuestNotificationForm, {
  validator as BabyShowerGuestNotificationValidator,
} from "./BabyShowerGuestNotificationForm"
import BabyShowerInvitationV1Form, {
  validator as BabyShowerInvitationV1Validator,
} from "./BabyShowerInvitationV1Form"
import WeddingGuestNotificationForm, {
  validator as WeddingGuestNotificationValidator,
} from "./WeddingGuestNotificationForm"
import WeddingInvitationV1Form, {
  validator as WeddingInvitationV1Validator,
} from "./WeddingInvitationV1Form"

export const handle: RouteHandle = {
  crumb: () => ({
    href: route("/dashboard/admin/whatsapp-broadcast"),
    name: "WhatsApp Broadcast",
  }),
  id: "dashboard-admin-whatsapp-broadcast",
}

export async function action({ request }: ActionFunctionArgs) {
  const queryResult = zx.parseQuerySafe(request, {
    template: z.enum([
      WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification,
      WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification,
      WHATSAPP_MESSAGE_TEMPLATES.BabyShowerInvitationV1,
      WHATSAPP_MESSAGE_TEMPLATES.WeddingInvitationV1,
    ]),
  })

  if (!queryResult.success) {
    return json({ error: queryResult.error, success: false } as const)
  }

  const { template } = queryResult.data
  const formData = await request.formData()

  switch (template) {
    case WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification: {
      const result =
        await BabyShowerGuestNotificationValidator.validate(formData)

      if (result.error) {
        return unprocessableEntity({
          ...result.error,
          response: null,
          success: false,
        } as const)
      }

      await SendWhatsAppTemplateMessageQueue.addBulk(
        result.data.phoneNumbers.map((phoneNumber) => ({
          data: {
            locale: "ES",
            payload: {
              imageUrl: generateCloudflareImageUrl(result.data.image, "public"),
              path: result.data.path,
              recipient: result.data.customer,
            },
            template,
            to: phoneNumber,
          },
          name: phoneNumber,
        })),
      )

      return json({
        amount: result.data.phoneNumbers.length,
        success: true,
      } as const)
    }

    case WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification: {
      const result = await WeddingGuestNotificationValidator.validate(formData)

      if (result.error) {
        return unprocessableEntity({
          ...result.error,
          response: null,
          success: false,
        } as const)
      }

      await SendWhatsAppTemplateMessageQueue.addBulk(
        result.data.phoneNumbers.map((phoneNumber) => ({
          data: {
            locale: "ES",
            payload: {
              imageUrl: generateCloudflareImageUrl(result.data.image, "public"),
              path: result.data.path,
              recipient: result.data.customer,
            },
            template,
            to: phoneNumber,
          },
          name: phoneNumber,
        })),
      )

      return json({
        amount: result.data.phoneNumbers.length,
        success: true,
      } as const)
    }

    case WHATSAPP_MESSAGE_TEMPLATES.BabyShowerInvitationV1: {
      const result = await BabyShowerInvitationV1Validator.validate(formData)

      if (result.error) {
        return unprocessableEntity({
          ...result.error,
          response: null,
          success: false,
        } as const)
      }

      await SendWhatsAppTemplateMessageQueue.addBulk(
        result.data.recipients.map((recipient) => ({
          data: {
            locale: "ES",
            payload: {
              babyName: result.data.babyName,
              date: result.data.date,
              imageUrl: generateCloudflareImageUrl(result.data.image, "public"),
              message: result.data.message,
              path: result.data.path,
              place: result.data.place,
              recipient: recipient.name,
            },
            template,
            to: recipient.phoneNumber,
          },
          name: `${recipient.name} - ${recipient.phoneNumber}`,
        })),
      )

      return json({
        amount: result.data.recipients.length,
        success: true,
      } as const)
    }

    case WHATSAPP_MESSAGE_TEMPLATES.WeddingInvitationV1: {
      const result = await WeddingInvitationV1Validator.validate(formData)

      if (result.error) {
        return unprocessableEntity({
          ...result.error,
          response: null,
          success: false,
        } as const)
      }

      await SendWhatsAppTemplateMessageQueue.addBulk(
        result.data.recipients.map((recipient) => ({
          data: {
            locale: "ES",
            payload: {
              coupleName: result.data.coupleName,
              date: result.data.date,
              imageUrl: generateCloudflareImageUrl(result.data.image, "public"),
              message: result.data.message,
              path: result.data.path,
              place: result.data.place,
              recipient: recipient.name,
            },
            template,
            to: recipient.phoneNumber,
          },
          name: `${recipient.name} - ${recipient.phoneNumber}`,
        })),
      )

      return json({
        amount: result.data.recipients.length,
        success: true,
      } as const)
    }

    default:
      return unprocessableEntity({
        error: "Invalid template",
        success: false,
      } as const)
  }
}

export default function WhatsAppBroadcastPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const template = searchParams.get("template")
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
      <div className="m-auto mt-8 flex flex-col gap-y-6 sm:max-w-3xl">
        <CardRadioGroup
          label="Template"
          onChange={(value) =>
            setSearchParams((params) => {
              params.set("template", value)

              return params
            })
          }
          options={[
            {
              description: "Notify guests of a wedding event",
              title: "Wedding Guest Notification",
              value: WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification,
            },
            {
              description: "Notify guests of a baby shower event",
              title: "Baby Shower Guest Notification",
              value: WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification,
            },
            {
              description: "Invite guests to a baby shower event",
              title: "Baby Shower Invitation V1",
              value: WHATSAPP_MESSAGE_TEMPLATES.BabyShowerInvitationV1,
            },
            {
              description: "Invite guests to a wedding event",
              title: "Wedding Invitation V1",
              value: WHATSAPP_MESSAGE_TEMPLATES.WeddingInvitationV1,
            },
          ]}
          value={template}
        />
      </div>

      <div className="m-auto mt-8 flex flex-col gap-y-6 sm:max-w-2xl">
        {template === WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification && (
          <WeddingGuestNotificationForm />
        )}
        {template ===
          WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification && (
          <BabyShowerGuestNotificationForm />
        )}
        {template === WHATSAPP_MESSAGE_TEMPLATES.BabyShowerInvitationV1 && (
          <BabyShowerInvitationV1Form />
        )}
        {template === WHATSAPP_MESSAGE_TEMPLATES.WeddingInvitationV1 && (
          <WeddingInvitationV1Form />
        )}
      </div>
    </div>
  )
}
