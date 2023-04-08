import { ReasonPhrases, StatusCodes } from "http-status-codes"

/**
 * @deprecated just do this in the handler
 */
export function getFormData(request: Request) {
  return request.clone().formData()
}

export function getHeaders(request: Request) {
  return request.clone().headers
}

export const Unauthorized = new Response(ReasonPhrases.UNAUTHORIZED, {
  status: StatusCodes.UNAUTHORIZED,
  statusText: ReasonPhrases.UNAUTHORIZED,
})

export const Forbidden = new Response(ReasonPhrases.FORBIDDEN, {
  status: StatusCodes.FORBIDDEN,
  statusText: ReasonPhrases.FORBIDDEN,
})

export const Accepted = new Response(ReasonPhrases.ACCEPTED, {
  status: StatusCodes.ACCEPTED,
  statusText: ReasonPhrases.ACCEPTED,
})

export const BadRequest = new Response(ReasonPhrases.BAD_REQUEST, {
  status: StatusCodes.BAD_REQUEST,
  statusText: ReasonPhrases.BAD_REQUEST,
})

export const InternalServerError = new Response(
  ReasonPhrases.INTERNAL_SERVER_ERROR,
  {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
  }
)

export const NotFound = new Response(ReasonPhrases.NOT_FOUND, {
  status: StatusCodes.NOT_FOUND,
  statusText: ReasonPhrases.NOT_FOUND,
})

export const NotImplemented = new Response(ReasonPhrases.NOT_IMPLEMENTED, {
  status: StatusCodes.NOT_IMPLEMENTED,
  statusText: ReasonPhrases.NOT_IMPLEMENTED,
})
