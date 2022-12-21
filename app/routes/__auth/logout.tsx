import type { LoaderArgs } from "@remix-run/node"

import auth from "~/helpers/auth.server"

export async function loader({ request }: LoaderArgs) {
  await auth.logout(request, { redirectTo: "/login" })
}
