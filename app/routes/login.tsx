import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"

import { auth } from "~/helpers/auth.server"
import sessionStorage from "~/helpers/session.server"

export let loader = async ({ request }: LoaderArgs) => {
  await auth.isAuthenticated(request, { successRedirect: "/dashboard" })
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  // This session key `auth:magiclink` is the default one used by the EmailLinkStrategy
  // you can customize it passing a `sessionMagicLinkKey` when creating an
  // instance.
  return json({
    magicLinkEmail: session.get("auth:email"),
    magicLinkSent: session.has("auth:magiclink"),
  })
}

export let action = async ({ request }: ActionArgs) => {
  // The success redirect is required in this action, this is where the user is
  // going to be redirected after the magic link is sent, note that here the
  // user is not yet authenticated, so you can't send it to a private page.
  await auth.authenticate("email-link", request, {
    // If this is not set, any error will be throw and the ErrorBoundary will be
    // rendered.
    failureRedirect: "/login",
    successRedirect: "/login",
  })
}

export default function LoginPage() {
  const { magicLinkSent, magicLinkEmail } = useLoaderData<typeof loader>()

  return (
    <Form action="/login" method="post">
      {magicLinkSent ? (
        <p>
          Successfully sent magic link{" "}
          {magicLinkEmail ? `to ${magicLinkEmail}` : ""}
        </p>
      ) : (
        <>
          <h1>Log in to your account.</h1>
          <div>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" name="email" required />
          </div>
          <button>Email a login link</button>
        </>
      )}
    </Form>
  )
}
