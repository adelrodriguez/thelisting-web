import { z } from "zod"

export const WHATSAPP_MESSAGE_TEMPLATES = {
  BabyShowerGuestNotification: "baby_shower_guest_notification",
  BabyShowerInvitationV1: "baby_shower_invitation_v1",
  ListingGiftPurchase: "listing_gift_purchase",
  WeddingGuestNotification: "wedding_guest_notification",
  WeddingInvitationV1: "wedding_invitation_v1",
} as const

export type WhatsAppMessageTemplate =
  (typeof WHATSAPP_MESSAGE_TEMPLATES)[keyof typeof WHATSAPP_MESSAGE_TEMPLATES]

export type TextParameter = {
  text: string
  type: "text"
}

export type ImageParameter = {
  image: {
    link: string
  }
  type: "image"
}

export type Parameter = TextParameter | ImageParameter

export type HeaderComponent<T extends Parameter[]> = {
  type: "header"
  parameters: T
}

export type BodyComponent<T extends Parameter[]> = {
  type: "body"
  parameters: T
}

export type ButtonComponent = {
  type: "button"
  parameters: TextParameter[]
  sub_type: "url"
  index: number
}

export const SendMessageSuccessSchema = z.object({
  contacts: z.array(
    z.object({
      input: z.string(),
      wa_id: z.string(),
    }),
  ),
  messages: z.array(
    z.object({
      id: z.string(),
    }),
  ),
  messaging_product: z.string(),
})

export const SendMessageErrorSchema = z.object({
  error: z.object({
    code: z.number(),
    error_data: z.object({
      details: z.string(),
      messaging_product: z.string(),
    }),
    fbtrace_id: z.string(),
    message: z.string(),
    type: z.string(),
  }),
})

export const SendMessageResultSchema = z.union([SendMessageSuccessSchema, SendMessageErrorSchema])

export type SendMessageResult = z.infer<typeof SendMessageResultSchema>
