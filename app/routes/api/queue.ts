import type { LoaderArgs } from "@remix-run/node"

import { testingQueue } from "~/helpers/queues"
import { OK } from "~/utils/http.server"

export async function loader({ request }: LoaderArgs): Promise<Response> {
  console.log("Requesting queue", request.url)

  testingQueue.add("testing queue", { url: request.url })

  return OK
}
