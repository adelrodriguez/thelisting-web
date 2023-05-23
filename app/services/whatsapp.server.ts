import type { Bot } from "whatsapp-cloud-api"
import { createBot } from "whatsapp-cloud-api"
import type { SendMessageResult } from "whatsapp-cloud-api/dist/sendRequestHelper"

import type { WhatsAppMessageTemplate } from "~/config/consts"
import { WHATSAPP_MESSAGE_TEMPLATES } from "~/config/consts"
import {
  META_GRAPH_API_USER_ACCESS_TOKEN,
  META_GRAPH_API_VERSION,
  WHATSAPP_PHONE_NUMBER_ID,
} from "~/config/env.server"

export type { SendMessageResult }

class WhatsApp {
  private bot: Bot

  constructor() {
    this.bot = createBot(
      WHATSAPP_PHONE_NUMBER_ID,
      META_GRAPH_API_USER_ACCESS_TOKEN,
      {
        version: META_GRAPH_API_VERSION,
      }
    )
  }

  public sendGuestNotification(
    template: WhatsAppMessageTemplate,
    to: string,
    {
      mediaUrl,
      customer,
      path,
    }: {
      mediaUrl?: string
      customer: string
      path: string
    }
  ) {
    return this.bot.sendTemplate(to, template, "ES", [
      {
        // @ts-expect-error Ignoring this since the type definition does not account
        // for any parameters in the header type.
        parameters: [
          {
            image: {
              link: mediaUrl,
            },
            type: "image",
          },
        ],
        type: "header",
      },
      {
        parameters: [
          {
            text: customer,
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
    ])
  }

  public async sendGiftPurchaseNotification(
    to: string,
    {
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
    }
  ): Promise<SendMessageResult> {
    return this.bot.sendTemplate(
      to,
      WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase,
      "ES",
      [
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
              text: amount.toString(),
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
    )
  }
}

const whatsapp = new WhatsApp()

export default whatsapp
