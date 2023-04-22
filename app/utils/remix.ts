import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

export function notFound(
  { message, title }: { message: string; title?: string } = {
    message: "Not found",
  }
) {
  return json(
    { message, title },
    { status: StatusCodes.NOT_FOUND, statusText: ReasonPhrases.NOT_FOUND }
  )
}

export function unauthorized(
  { message, title }: { message: string; title?: string } = {
    message: "Unauthorized",
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
    message: "Forbidden",
  }
) {
  return json(
    { message, title },
    { status: StatusCodes.FORBIDDEN, statusText: ReasonPhrases.FORBIDDEN }
  )
}

export function badRequest(
  { message, title }: { message: string; title?: string } = {
    message: "Bad request",
  }
) {
  return json(
    { message, title },
    { status: StatusCodes.BAD_REQUEST, statusText: ReasonPhrases.BAD_REQUEST }
  )
}
