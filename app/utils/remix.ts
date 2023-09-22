import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

import type { LocaleFile } from "./i18n"

/**
 * Used to define the handle for a route.
 */
export type RouteHandle<Params = unknown> = {
  /**
   * Used to show the route in the dashboard's breadcrumbs.
   */
  crumb?: (args: { params: Params }) => { href: string; name: string }
  /**
   * A unique identifier for the route.
   */
  id: string
  /**
   * Used for internationalization.
   */
  i18n?: LocaleFile | LocaleFile[]
}

export function notFound(
  { message, title }: { message: string; title?: string } = {
    message: "The requested resource was not found.",
    title: "Not Found",
  }
) {
  return json(
    { message, title },
    { status: StatusCodes.NOT_FOUND, statusText: ReasonPhrases.NOT_FOUND }
  )
}

export function unauthorized(
  { message, title }: { message: string; title?: string } = {
    message: "You are not authorized to access this resource.",
    title: "Unauthorized",
  }
) {
  return json(
    { message, title },
    {
      status: StatusCodes.UNAUTHORIZED,
      statusText: ReasonPhrases.UNAUTHORIZED,
    }
  )
}

export function forbidden(
  { message, title }: { message: string; title?: string } = {
    message: "You are not allowed to access this resource.",
    title: "Forbidden",
  }
) {
  return json(
    { message, title },
    { status: StatusCodes.FORBIDDEN, statusText: ReasonPhrases.FORBIDDEN }
  )
}

export function badRequest(
  { message, title }: { message: string; title?: string } = {
    message: "The request was invalid.",
    title: "Bad Request",
  }
) {
  return json(
    { message, title },
    { status: StatusCodes.BAD_REQUEST, statusText: ReasonPhrases.BAD_REQUEST }
  )
}

export function notAllowed(
  { message, title }: { message: string; title?: string } = {
    message: "The request method is not allowed.",
    title: "Method Not Allowed",
  }
) {
  return json(
    { message, title },
    {
      status: StatusCodes.METHOD_NOT_ALLOWED,
      statusText: ReasonPhrases.METHOD_NOT_ALLOWED,
    }
  )
}

export function internalServerError(
  { message, title }: { message: string; title?: string } = {
    message: "An unexpected error occurred.",
    title: "Server Error",
  }
) {
  return json(
    { message, title },
    {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
    }
  )
}
