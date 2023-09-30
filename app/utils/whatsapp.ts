import {
  BodyComponent,
  ButtonComponent,
  HeaderComponent,
  ImageParameter,
  TextParameter,
  WHATSAPP_MESSAGE_TEMPLATES,
} from "~/services/whatsapp/types"

export type TemplateToComponentsMap = {
  [WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase]: GiftPurchaseNotificationComponents
  [WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification]: BabyShowerGuestNotificationComponents
  [WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification]: WeddingGuestNotificationComponents
}

type GiftPurchaseNotificationComponents = [
  BodyComponent<[TextParameter, TextParameter, TextParameter, TextParameter]>,
  ButtonComponent
]

export function generateGiftPurchaseNotificationComponents({
  recipient,
  buyer,
  amount,
  gift,
  path,
}: {
  recipient: string
  buyer: string
  amount: string
  gift: string
  path: string
}): GiftPurchaseNotificationComponents {
  return [
    {
      parameters: [
        {
          text: recipient,
          type: "text",
        },
        {
          text: buyer,
          type: "text",
        },
        {
          text: amount,
          type: "text",
        },
        {
          text: gift,
          type: "text",
        },
      ],
      type: "body",
    },
    {
      index: 0,
      parameters: [
        {
          text: path,
          type: "text",
        },
      ],
      sub_type: "url",
      type: "button",
    },
  ]
}

export type BabyShowerGuestNotificationComponents = [
  HeaderComponent<[ImageParameter]>,
  BodyComponent<[TextParameter, TextParameter]>,
  ButtonComponent
]

export function generateBabyShowerGuestNotificationComponents({
  imageUrl,
  recipient,
  path,
}: {
  imageUrl: string
  recipient: string
  path: string
}): BabyShowerGuestNotificationComponents {
  return [
    {
      parameters: [
        {
          image: {
            link: imageUrl,
          },
          type: "image",
        },
      ],
      type: "header",
    },
    {
      parameters: [
        {
          text: recipient,
          type: "text",
        },
        {
          text: path,
          type: "text",
        },
      ],
      type: "body",
    },
    {
      index: 0,
      parameters: [
        {
          text: path,
          type: "text",
        },
      ],
      sub_type: "url",
      type: "button",
    },
  ]
}

export type WeddingGuestNotificationComponents = [
  HeaderComponent<[ImageParameter]>,
  BodyComponent<[TextParameter, TextParameter]>,
  ButtonComponent
]

export function generateWeddingGuestNotificationComponents({
  imageUrl,
  recipient,
  path,
}: {
  imageUrl: string
  recipient: string
  path: string
}): WeddingGuestNotificationComponents {
  return [
    {
      parameters: [
        {
          image: {
            link: imageUrl,
          },
          type: "image",
        },
      ],
      type: "header",
    },
    {
      parameters: [
        {
          text: recipient,
          type: "text",
        },
        {
          text: path,
          type: "text",
        },
      ],
      type: "body",
    },
    {
      index: 0,
      parameters: [
        {
          text: path,
          type: "text",
        },
      ],
      sub_type: "url",
      type: "button",
    },
  ]
}
