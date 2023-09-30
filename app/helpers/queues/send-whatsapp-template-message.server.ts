import { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import { isDevelopment } from "~/config/vars"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import whatsapp from "~/services/whatsapp/client.server"
import {
  SendMessageResult,
  WHATSAPP_MESSAGE_TEMPLATES,
} from "~/services/whatsapp/types"
import {
  generateBabyShowerGuestNotificationComponents,
  generateGiftPurchaseNotificationComponents,
  generateWeddingGuestNotificationComponents,
} from "~/utils/whatsapp"

export type QueueData =
  | {
      to: string
      template: typeof WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification
      locale: "ES"
      payload: Parameters<
        typeof generateBabyShowerGuestNotificationComponents
      >[0]
    }
  | {
      to: string
      template: typeof WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase
      locale: "ES"
      payload: Parameters<typeof generateGiftPurchaseNotificationComponents>[0]
    }
  | {
      to: string
      template: typeof WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification
      locale: "ES"
      payload: Parameters<typeof generateWeddingGuestNotificationComponents>[0]
    }

export const processor: Processor<QueueData> = async (job) => {
  const { to, template, locale, payload } = job.data

  if (isDevelopment) {
    await job.log("Development mode, skipping")
    return
  }

  let response: SendMessageResult

  switch (template) {
    case WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification: {
      const components = generateBabyShowerGuestNotificationComponents(payload)
      response = await whatsapp.sendTemplate(to, template, locale, components)
      break
    }
    case WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase: {
      const components = generateGiftPurchaseNotificationComponents(payload)
      response = await whatsapp.sendTemplate(to, template, locale, components)
      break
    }
    case WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification: {
      const components = generateWeddingGuestNotificationComponents(payload)
      response = await whatsapp.sendTemplate(to, template, locale, components)
      break
    }
    default:
      throw new Error(`Unknown template: ${template}`)
  }

  if ("error" in response) {
    void job.log(`Unable to send WhatsApp message: ${response.error.message}`)

    Sentry.captureException(response.error)

    throw new Error(response.error.message)
  }
}

export default createQueue(QUEUE_NAMES.SendWhatsAppTemplateMessage, processor)
