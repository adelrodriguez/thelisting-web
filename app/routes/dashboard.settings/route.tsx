import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { setFormDefaults, validationError } from "remix-validated-form"
import { z } from "zod"

import { Form, Input, SubmitButton } from "~/components/form"
import auth from "~/helpers/auth.server"
import { unauthorized } from "~/utils/http"
import type { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle = {
  crumb: () => ({
    href: "/dashboard/settings",
    name: "User Settings",
  }),
  id: "dashboard-settings",
}

const EditUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
})

const validator = withZod(EditUserSchema)

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { db } = context

  const { id } = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  const user = await db.user.findUniqueOrThrow({
    where: { id },
  })

  return json(setFormDefaults("editUser", user))
}

export async function action({ context, request }: LoaderFunctionArgs) {
  const { db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized({
      message: "You must be logged in to edit your user settings",
    })
  }

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  await db.user.update({
    data: result.data,
    where: { id: user.id },
  })

  return null
}

export default function DashboardSettingsPage() {
  const { enqueueSnackbar } = useSnackbar()

  return (
    <Form
      className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
      id="editUser"
      method="POST"
      onSubmit={() => {
        enqueueSnackbar("User updated 🎉", {
          description: "The user was successfully updated",
          variant: "success",
        })
      }}
      validator={validator}
    >
      <Input label="First Name" name="firstName" required />
      <Input label="Last Name" name="lastName" required />
      <Input label="Email" name="email" required />
      <Input label="Phone" name="phone" required />

      <SubmitButton loadingText="Updating...">Update</SubmitButton>
    </Form>
  )
}
