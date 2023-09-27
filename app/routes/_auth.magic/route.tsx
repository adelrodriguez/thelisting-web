import type { LoaderFunctionArgs } from "@remix-run/node"
import { route } from "routes-gen"

import auth from "~/helpers/auth.server"

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.authenticate("email-link", request, {
    // If something failed we take them back to the login page
    // This redirect is optional, if not defined any error will be throw and
    // the ErrorBoundary will be rendered.
    failureRedirect: route("/register"),
    // If the user was authenticated, we redirect them to their profile page
    // This redirect is optional, if not defined the user will be returned by
    // the `authenticate` function and you can render something on this page
    // manually redirect the user.
    successRedirect: route("/dashboard"),
  })
}
