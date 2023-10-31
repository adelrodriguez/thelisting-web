import { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import { isDevelopment } from "~/config/vars"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import whatsapp from "~/services/whatsapp/client.server"
import { WHATSAPP_MESSAGE_TEMPLATES } from "~/services/whatsapp/types"
import {
  TemplateToParametersMap,
  generateBabyShowerGuestNotificationComponents,
  generateBabyShowerInvitationV1Components,
  generateGiftPurchaseNotificationComponents,
  generateWeddingGuestNotificationComponents,
} from "~/utils/whatsapp"

export type QueueData = {
  [K in (typeof WHATSAPP_MESSAGE_TEMPLATES)[keyof typeof WHATSAPP_MESSAGE_TEMPLATES]]: {
    to: string
    template: K
    locale: "ES"
    payload: TemplateToParametersMap[K]
  }
}[(typeof WHATSAPP_MESSAGE_TEMPLATES)[keyof typeof WHATSAPP_MESSAGE_TEMPLATES]]

export const processor: Processor<QueueData> = async (job) => {
  const { to, template, locale, payload } = job.data

  if (isDevelopment) {
    await job.log("Development mode, skipping")
    return
  }

  let components

  switch (template) {
    case WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification: {
      components = generateBabyShowerGuestNotificationComponents(payload)
      break
    }
    case WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase: {
      components = generateGiftPurchaseNotificationComponents(payload)
      break
    }
    case WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification: {
      components = generateWeddingGuestNotificationComponents(payload)
      break
    }
    case WHATSAPP_MESSAGE_TEMPLATES.BabyShowerInvitationV1: {
      components = generateBabyShowerInvitationV1Components(payload)
      break
    }
    default:
      throw new Error(`Unknown template: ${template}`)
  }

  const response = await whatsapp.sendTemplate(to, template, locale, components)

  if ("error" in response) {
    await job.log(`Unable to send WhatsApp message: ${response.error.message}`)

    Sentry.captureException(response.error)

    throw new Error(response.error.message)
  }
}

export default createQueue(QUEUE_NAMES.SendWhatsAppTemplateMessage, processor)
