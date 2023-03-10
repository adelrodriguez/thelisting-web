import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { unauthorized } from "remix-utils"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"

import { FormInput, FormSubmit } from "~/components/form"
import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { getFormData } from "~/utils/http.server"

export const handle = {
  crumb: () => ({
    href: "/dashboard/settings",
    name: "User Settings",
  }),
}

const EditUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
})

const validator = withZod(EditUserSchema)

export async function loader({ request }: LoaderArgs) {
  const { id } = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  const user = await db.user.findUniqueOrThrow({
    where: { id },
  })

  return json(setFormDefaults("editUser", user))
}

export async function action({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user)
    throw unauthorized("You must be logged in to edit your user settings")

  const formData = await getFormData(request)
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
    <ValidatedForm
      validator={validator}
      method="post"
      className="m-auto mt-8 flex flex-col gap-y-6 sm:w-[500px]"
      id="editUser"
      onSubmit={() => {
        enqueueSnackbar("User updated 🎉", {
          description: "The user was successfully updated",
          variant: "success",
        })
      }}
    >
      <FormInput label="First Name" name="firstName" required />
      <FormInput label="Last Name" name="lastName" required />
      <FormInput label="Email" name="email" required />
      <FormInput label="Phone" name="phone" required />

      <FormSubmit text="Update" loadingText="Updating..." />
    </ValidatedForm>
  )
}
