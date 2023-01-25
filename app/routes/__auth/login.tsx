import { Transition } from "@headlessui/react"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"

import { Logo } from "~/components/branding"
import { Alert, Button } from "~/components/common"
import { FormInput } from "~/components/form"
import auth from "~/helpers/auth.server"
import sessionStorage from "~/helpers/session.server"
import { getFormData } from "~/utils/http.server"

const validator = withZod(
  z.object({
    email: z.string().email("Please enter a valid email address"),
  })
)

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)

  await auth.isAuthenticated(request, { successRedirect: "/dashboard" })
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  // This session key `auth:magiclink` is the default one used by the EmailLinkStrategy
  // you can customize it passing a `sessionMagicLinkKey` when creating an
  // instance.
  return json({
    error: url.searchParams.get("error"),
    magicLinkEmail: session.get("auth:email"),
    magicLinkSent: session.has("auth:magiclink"),
    success: url.searchParams.get("success"),
  })
}

export async function action({ request }: ActionArgs) {
  const formData = await getFormData(request)
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  // The success redirect is required in this action, this is where the user is
  // going to be redirected after the magic link is sent, note that here the
  // user is not yet authenticated, so you can't send it to a private page.
  await auth.authenticate("email-link", request, {
    // If this is not set, any error will be throw and the ErrorBoundary will be
    // rendered.
    failureRedirect: "/login?error",
    successRedirect: "/login?success",
  })
}

export default function LoginPage() {
  const { success, error } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  const isSuccess = typeof success === "string"
  const isError = typeof error === "string"
  const show = isSuccess || isError

  return (
    <div className="flex min-h-full bg-white">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <main className="mx-auto w-full max-w-sm lg:w-96">
          <Logo />
          <h2 className="my-6 text-3xl font-bold tracking-tight text-gray-900">
            Bienvenidos a The Listing
          </h2>

          <Transition
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            show={show && isSuccess}
          >
            <Alert
              onClose={() => navigate("/login", { replace: true })}
              type="success"
            >
              We sent you a magic link to your email. Please check your inbox.
            </Alert>
          </Transition>
          <Transition
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            show={show && isError}
          >
            <Alert
              onClose={() => navigate("/login", { replace: true })}
              type="error"
            >
              We can't find an account with that email address. Please contact
              the administrator to create an account.
            </Alert>
          </Transition>

          <div className="mt-8">
            <ValidatedForm
              validator={validator}
              method="post"
              resetAfterSubmit
              className="space-y-6"
              defaultValues={{ email: "" }}
            >
              <FormInput
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
              />
              <Button type="submit" className="w-full justify-center">
                Log in
              </Button>
            </ValidatedForm>
          </div>
        </main>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
          alt=""
        />
      </div>
    </div>
  )
}
