import { UserRole } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { RouteMatch } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { useSnackbar } from "notistack"
import { notFound } from "remix-utils"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import { FormInput, FormListRadioGroup, FormSubmit } from "~/components/form"
import { isUserAdmin } from "~/utils/auth.server"
import { getUserFullName, UserSchema } from "~/utils/user"

const validator = withZod(UserSchema)

export const handle = {
  crumb: ({ params, data }: RouteMatch) => ({
    href: `/dashboard/admin/users/${params.userId}/`,
    name: getUserFullName(data.user),
  }),
}

export async function loader({ params, context }: LoaderArgs) {
  const { db } = context
  const { user: id } = zx.parseParams(params, { user: z.string() })

  const user = await db.user.findUnique({
    where: { id },
  })

  if (!user) {
    throw json(
      {
        message: "Sorry, we couldn’t find the page you’re looking for.",
      },
      {
        status: StatusCodes.NOT_FOUND,
        statusText: ReasonPhrases.NOT_FOUND,
      }
    )
  }

  return json(setFormDefaults("edit-user", user))
}

export async function action({ request, params, context }: ActionArgs) {
  const { db } = context
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

  const formData = await request.formData()
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
      className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
      id="edit-user"
      method="POST"
      onSubmit={() => {
        enqueueSnackbar("User updated 🎉", {
          description: "The user was successfully updated",
          variant: "success",
        })
      }}
      validator={validator}
    >
      <FormInput label="First Name" name="firstName" required />
      <FormInput label="Last Name" name="lastName" required />
      <FormInput
        description="The user's email address to receive email notifications"
        label="Email"
        name="email"
        required
      />
      <FormInput
        description="The user's phone number to receive WhatsApp notifications"
        label="Phone"
        name="phone"
      />

      <FormListRadioGroup
        label="Role"
        name="role"
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

      <FormSubmit loadingText="Updating..." text="Update" />
    </ValidatedForm>
  )
}
