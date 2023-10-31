import {
  BodyComponent,
  ButtonComponent,
  HeaderComponent,
  ImageParameter,
  TextParameter,
  WHATSAPP_MESSAGE_TEMPLATES,
} from "~/services/whatsapp/types"

export type TemplateToComponentsMap = {
  [WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification]: BabyShowerGuestNotificationComponents
  [WHATSAPP_MESSAGE_TEMPLATES.BabyShowerInvitationV1]: BabyShowerInvitationV1Components
  [WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase]: GiftPurchaseNotificationComponents
  [WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification]: WeddingGuestNotificationComponents
}

export type TemplateToParametersMap = {
  [WHATSAPP_MESSAGE_TEMPLATES.BabyShowerGuestNotification]: Parameters<
    typeof generateBabyShowerGuestNotificationComponents
  >[0]
  [WHATSAPP_MESSAGE_TEMPLATES.BabyShowerInvitationV1]: Parameters<
    typeof generateBabyShowerInvitationV1Components
  >[0]
  [WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase]: Parameters<
    typeof generateGiftPurchaseNotificationComponents
  >[0]
  [WHATSAPP_MESSAGE_TEMPLATES.WeddingGuestNotification]: Parameters<
    typeof generateWeddingGuestNotificationComponents
  >[0]
}

type GiftPurchaseNotificationComponents = [
  BodyComponent<[TextParameter, TextParameter, TextParameter, TextParameter]>,
  ButtonComponent,
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
  ButtonComponent,
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
  ButtonComponent,
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

export type BabyShowerInvitationV1Components = [
  HeaderComponent<[ImageParameter]>,
  BodyComponent<
    [TextParameter, TextParameter, TextParameter, TextParameter, TextParameter]
  >,
  ButtonComponent,
]

export function generateBabyShowerInvitationV1Components({
  babyName,
  date,
  imageUrl,
  message,
  place,
  recipient,
  url,
}: {
  babyName: string
  date: string
  imageUrl: string
  message: string
  place: string
  recipient: string
  url: string
}): BabyShowerInvitationV1Components {
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
          text: babyName,
          type: "text",
        },
        {
          text: date,
          type: "text",
        },
        {
          text: place,
          type: "text",
        },
        {
          text: message,
          type: "text",
        },
      ],
      type: "body",
    },
    {
      index: 0,
      parameters: [
        {
          text: url,
          type: "text",
        },
      ],
      sub_type: "url",
      type: "button",
    },
  ]
}
