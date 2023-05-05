import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

export function loader() {
  return json(
    {
      timestamp: Date.now(),
    },
    {
      status: StatusCodes.OK,
      statusText: ReasonPhrases.OK,
    }
  )
}
