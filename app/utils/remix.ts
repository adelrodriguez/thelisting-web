import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

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
