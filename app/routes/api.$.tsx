import { ReasonPhrases } from "http-status-codes"
import { notFound } from "remix-utils"

export function loader() {
  return notFound(
    { message: "Route not found" },
    {
      statusText: ReasonPhrases.NOT_FOUND,
    }
  )
}
