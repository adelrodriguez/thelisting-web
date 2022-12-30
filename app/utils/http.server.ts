import { ReasonPhrases, StatusCodes } from "http-status-codes"

export async function getFormData(request: Request) {
  return request.clone().formData()
}

export const Unauthorized = new Response(ReasonPhrases.UNAUTHORIZED, {
  status: StatusCodes.UNAUTHORIZED,
  statusText: ReasonPhrases.UNAUTHORIZED,
})

export const OK = new Response(ReasonPhrases.OK, {
  status: StatusCodes.OK,
  statusText: ReasonPhrases.OK,
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

export { ReasonPhrases, StatusCodes }
