import { Transition } from "@headlessui/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { useTranslation } from "react-i18next"
import { route } from "routes-gen"
import { z } from "zod"
import { parseFormSafe, zx } from "zodix"

import { Logo } from "~/components/branding"
import { Alert, Button } from "~/components/common"
import { Spinner } from "~/components/loading"
import auth from "~/helpers/auth.server"
import sessionStorage from "~/helpers/session.server"
import { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle = {
  id: "login",
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { success } = zx.parseQuery(
    request,
    z.object({ success: zx.BoolAsString.optional() }),
  )

  await auth.isAuthenticated(request, { successRedirect: route("/dashboard") })
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  // This session key `auth:magiclink` is the default one used by the
  // EmailLinkStrategy you can customize it passing a `sessionMagicLinkKey` when
  // creating an instance.
  return json({
    magicLinkEmail: session.get("auth:email"),
    magicLinkSent: session.has("auth:magiclink"),
    success,
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const result = await parseFormSafe(
    request,
    z.object({ email: z.string().email() }),
  )

  if (!result.success) {
    return redirect("/login?error", {
      status: StatusCodes.SEE_OTHER,
      statusText: ReasonPhrases.SEE_OTHER,
    })
  }

  // The success redirect is required in this action, this is where the user is
  // going to be redirected after the magic link is sent, note that here the
  // user is not yet authenticated, so you can't send it to a private page.
  return auth.authenticate("email-link", request, {
    // If this is not set, any error will be throw and the ErrorBoundary will be
    // rendered.
    failureRedirect: "/login?success=false",
    successRedirect: "/login?success=true",
  })
}

export default function LoginPage() {
  const { success } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { t } = useTranslation(["dashboard", "common"])

  const isSubmitting = navigation.state === "submitting"
  const show = typeof success === "boolean"

  return (
    <div className="flex h-screen min-h-full bg-white">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <main className="mx-auto w-full max-w-sm lg:w-96">
          <Logo />
          <h2 className="my-6 font-heading text-3xl font-bold tracking-tight text-gray-900">
            {t("dashboard:login.welcome")}
          </h2>

          <Transition
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            show={show && success}
          >
            <Alert
              onClose={() => navigate("/login", { replace: true })}
              type="success"
            >
              {t("login.magic_link_sent")}
            </Alert>
          </Transition>
          <Transition
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            show={show && !success}
          >
            <Alert
              onClose={() => navigate("/login", { replace: true })}
              type="error"
            >
              {t("login.magic_link_sent")}
            </Alert>
          </Transition>

          <div className="mt-4">
            <Form className="space-y-3" method="POST">
              <div>
                <label className="sr-only" htmlFor="email">
                  Email
                </label>
                <input
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
                  id="email"
                  name="email"
                  placeholder={t("login.enter_email")}
                  type="email"
                />
              </div>
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Spinner />
                    {t("common:logging_in")}
                  </>
                ) : (
                  t("common:login")
                )}
              </Button>
            </Form>
          </div>
        </main>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
        />
      </div>
    </div>
  )
}
