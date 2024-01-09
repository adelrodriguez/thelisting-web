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
  [WHATSAPP_MESSAGE_TEMPLATES.WeddingInvitationV1]: WeddingInvitationV1Components
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
  [WHATSAPP_MESSAGE_TEMPLATES.WeddingInvitationV1]: Parameters<
    typeof generateWeddingInvitationV1Components
  >[0]
}

type GiftPurchaseNotificationComponents = [
  BodyComponent<[TextParameter, TextParameter, TextParameter, TextParameter]>,
  ButtonComponent,
]

export function generateGiftPurchaseNotificationComponents({
  amount,
  buyer,
  gift,
  path,
  recipient,
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
  path,
  recipient,
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
  path,
  recipient,
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
  path,
  place,
  recipient,
}: {
  babyName: string
  date: string
  imageUrl: string
  message: string
  path: string
  place: string
  recipient: string
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
          text: path,
          type: "text",
        },
      ],
      sub_type: "url",
      type: "button",
    },
  ]
}

export type WeddingInvitationV1Components = [
  HeaderComponent<[ImageParameter]>,
  BodyComponent<
    [TextParameter, TextParameter, TextParameter, TextParameter, TextParameter]
  >,
  ButtonComponent,
]

export function generateWeddingInvitationV1Components({
  coupleName,
  date,
  imageUrl,
  message,
  path,
  place,
  recipient,
}: {
  coupleName: string
  date: string
  imageUrl: string
  message: string
  path: string
  place: string
  recipient: string
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
          text: coupleName,
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
          text: path,
          type: "text",
        },
      ],
      sub_type: "url",
      type: "button",
    },
  ]
}
