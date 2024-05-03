import { ALEGRA_API_TOKEN, ALEGRA_API_USERNAME } from "~/config/env.server"
import logger from "~/helpers/logger.server"
import type {
  CreateContactRequest,
  CreateContactResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  GetContactRequest,
  GetContactResponse,
  GetCurrencyRequest,
  GetCurrencyResponse,
  SendInvoiceRequest,
  SendInvoiceResponse,
} from "~/utils/alegra"
import {
  parseCreateContactResponse,
  parseCreateInvoiceResponse,
  parseGetContactResponse,
  parseGetCurrencyResponse,
  parseSendInvoiceResponse,
} from "~/utils/alegra"
import { AlegraError } from "~/utils/error"

export class Alegra {
  private baseUrl: string
  private headers: Headers

  constructor() {
    this.baseUrl = "https://app.alegra.com/api/v1"
    this.headers = new Headers({
      Authorization:
        "Basic " + Buffer.from(ALEGRA_API_USERNAME + ":" + ALEGRA_API_TOKEN).toString("base64"),
      "Content-Type": "application/json",
    })
  }

  private buildUrl(path: string) {
    return `${this.baseUrl}/${path}`
  }

  private async getRequest(path: string): Promise<Response> {
    return fetch(this.buildUrl(path), {
      headers: this.headers,
      method: "GET",
    })
  }

  private async postRequest(path: string, body: unknown): Promise<Response> {
    return fetch(this.buildUrl(path), {
      body: JSON.stringify(body),
      headers: this.headers,
      method: "POST",
    })
  }

  public get contacts() {
    return {
      create: async (request: CreateContactRequest): Promise<CreateContactResponse> => {
        try {
          const response = await this.postRequest("contacts", request)
          const data = await response.json()

          logger.info("contacts.create response", { data })

          return parseCreateContactResponse(data)
        } catch (error) {
          throw new AlegraError((error as Error).message, "create_contact_error")
        }
      },
      get: async (request: GetContactRequest): Promise<GetContactResponse> => {
        try {
          const response = await this.getRequest(`contacts/${request.id}`)
          const data = await response.json()

          logger.info("contacts.get response", { data })

          return parseGetContactResponse(data)
        } catch (error) {
          throw new AlegraError((error as Error).message, "get_contact_error")
        }
      },
    }
  }

  public get currencies() {
    return {
      get: async (request: GetCurrencyRequest): Promise<GetCurrencyResponse> => {
        // Alegra doesn't support the Dominican Peso, so we need to hardcode
        if (request.code === "DOP") {
          return {
            code: "DOP",
            exchangeRate: 1,
            name: "Dominican Peso",
            status: "active",
            symbol: "$",
          }
        }

        try {
          const response = await this.getRequest(`currencies/${request.code}`)
          const data = await response.json()

          logger.info("currencies.get response", { data })

          return parseGetCurrencyResponse(data)
        } catch (error) {
          throw new AlegraError((error as Error).message, "get_currency_error")
        }
      },
    }
  }

  public get invoices() {
    return {
      create: async (request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> => {
        try {
          const response = await this.postRequest("invoices", request)
          const data = await response.json()

          logger.info("invoices.create response", { data })

          return parseCreateInvoiceResponse(data)
        } catch (error) {
          throw new AlegraError((error as Error).message, "create_invoice_error")
        }
      },
      send: async (request: SendInvoiceRequest): Promise<SendInvoiceResponse> => {
        try {
          const response = await this.postRequest(`invoices/${request.id}/email`, request)
          const data = await response.json()

          logger.info("invoices.send response", { data })

          return parseSendInvoiceResponse(data)
        } catch (error) {
          throw new AlegraError((error as Error).message, "send_invoice_error")
        }
      },
    }
  }
}

const alegra = new Alegra()

export default alegra
