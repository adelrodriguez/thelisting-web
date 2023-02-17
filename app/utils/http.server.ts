import { ReasonPhrases, StatusCodes } from "http-status-codes"

export function getFormData(request: Request) {
  return request.clone().formData()
}

export function getJSON(request: Request) {
  return request.clone().json()
}

export function getHeaders(request: Request) {
  return request.clone().headers
}

export function getText(request: Request) {
  return request.clone().text()
}

export function getURL(request: Request) {
  return request.clone().url
}

export function getMethod(request: Request) {
  return request.clone().method
}

export function getBody(request: Request) {
  return request.clone().body
}

export function verifyMethod(
  request: Request,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
) {
  if (getMethod(request) !== method) throw NotAllowed
}

export const Unauthorized = new Response(ReasonPhrases.UNAUTHORIZED, {
  status: StatusCodes.UNAUTHORIZED,
  statusText: ReasonPhrases.UNAUTHORIZED,
})

export const Forbidden = new Response(ReasonPhrases.FORBIDDEN, {
  status: StatusCodes.FORBIDDEN,
  statusText: ReasonPhrases.FORBIDDEN,
})

export const OK = new Response(ReasonPhrases.OK, {
  status: StatusCodes.OK,
  statusText: ReasonPhrases.OK,
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

export const NotAllowed = new Response(ReasonPhrases.METHOD_NOT_ALLOWED, {
  status: StatusCodes.METHOD_NOT_ALLOWED,
  statusText: ReasonPhrases.METHOD_NOT_ALLOWED,
})

export { ReasonPhrases, StatusCodes }
