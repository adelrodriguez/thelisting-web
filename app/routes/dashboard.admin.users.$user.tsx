import { UserRole } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import type { RouteMatch } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { notFound } from "remix-utils"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"

import { FormInput, FormListRadioGroup, FormSubmit } from "~/components/form"
import db from "~/helpers/db.server"
import { isUserAdmin } from "~/utils/auth.server"
import { getFormData } from "~/utils/http.server"
import { getParam, json } from "~/utils/remix"
import { getUserFullName, UserSchema } from "~/utils/user"

const validator = withZod(UserSchema)

export const handle = {
  crumb: ({ params, data }: RouteMatch) => ({
    href: `/dashboard/admin/users/${params.userId}/`,
    name: getUserFullName(data.user),
  }),
}

export async function loader({ params }: LoaderArgs) {
  const userId = getParam(params, "user")

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw notFound("User not found")
  }

  return json({ user, ...setFormDefaults("editUser", user) })
}

export async function action({ request, params }: ActionArgs) {
  const userId = params.userId

  await isUserAdmin(request)

  if (!userId) {
    throw notFound("User not found")
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw notFound("User not found")
  }

  const formData = await getFormData(request)
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  const updatedUser = await db.user.update({
    data: result.data,
    where: { id: user.id },
  })

  return json({ user: updatedUser })
}

export default function AdminToolsUserEditPage() {
  const { enqueueSnackbar } = useSnackbar()

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
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
      <FormInput
        name="email"
        label="Email"
        description="The user's email address to receive email notifications"
        required
      />
      <FormInput
        name="phone"
        label="Phone"
        description="The user's phone number to receive WhatsApp notifications"
      />

      <FormListRadioGroup
        name="role"
        label="Role"
        options={[
          {
            description: "A regular user without admin privileges",
            label: "User",
            value: UserRole.User,
          },
          {
            description: "A user with admin privileges",
            label: "Admin",
            value: UserRole.Admin,
          },
        ]}
        required
      />

      <FormSubmit text="Update" loadingText="Updating..." />
    </ValidatedForm>
  )
}
