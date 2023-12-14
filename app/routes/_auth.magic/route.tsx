import type { LoaderFunctionArgs } from "@remix-run/node"
import { route } from "routes-gen"

import auth from "~/helpers/auth.server"

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.authenticate("email-link", request, {
    failureRedirect: route("/register"),
    successRedirect: route("/dashboard"),
  })
}
