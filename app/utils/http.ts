export { ReasonPhrases, StatusCodes } from "http-status-codes"

export async function getFormData(request: Request) {
  return request.clone().formData()
}
