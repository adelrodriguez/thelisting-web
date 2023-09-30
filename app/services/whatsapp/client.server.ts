import {
  META_GRAPH_API_USER_ACCESS_TOKEN,
  META_GRAPH_API_VERSION,
  WHATSAPP_PHONE_NUMBER_ID,
} from "~/config/env.server"
import { TemplateToComponentsMap } from "~/utils/whatsapp"

import {
  SendMessageResult,
  SendMessageResultSchema,
  WhatsAppMessageTemplate,
} from "./types"

class WhatsApp {
  private baseUrl: string
  private headers: Headers

  constructor() {
    this.baseUrl = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}`
    this.headers = new Headers({
      Authorization: `Bearer ${META_GRAPH_API_USER_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    })
  }

  private buildUrl(path: string) {
    return `${this.baseUrl}/${path}`
  }

  private async postRequest(path: string, body: unknown): Promise<Response> {
    return fetch(this.buildUrl(path), {
      body: JSON.stringify(body),
      headers: this.headers,
      method: "POST",
    })
  }

  public async sendTemplate(
    to: string,
    template: WhatsAppMessageTemplate,
    locale: string,
    components: TemplateToComponentsMap[typeof template]
  ): Promise<SendMessageResult> {
    const res = await this.postRequest("messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      template: {
        components,
        language: {
          code: locale,
        },
        name: template,
      },
      to,
      type: "template",
    })

    const data = await res.json()

    return SendMessageResultSchema.parse(data)
  }
}

const whatsapp = new WhatsApp()

export default whatsapp
