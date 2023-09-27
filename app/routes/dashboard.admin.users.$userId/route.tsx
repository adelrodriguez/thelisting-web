import { UserRole } from "@prisma/client"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { setFormDefaults, validationError } from "remix-validated-form"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { Form, Input, ListRadioGroup, SubmitButton } from "~/components/form"
import { isUserAdmin } from "~/utils/auth.server"
import { RouteHandle, notFound } from "~/utils/remix"
import { getUserFullName, UserSchema } from "~/utils/user"

const validator = withZod(UserSchema)

export const handle: RouteHandle<{ userId: string }, typeof loader> = {
  crumb: ({ params, data }) => ({
    href: route("/dashboard/admin/users/:userId", {
      userId: params.userId,
    }),
    name: getUserFullName(data.user),
  }),
  id: "dashboard-admin-users-edit",
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { db } = context
  const { userId } = zx.parseParams(params, { userId: z.string() })

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw notFound({
      message: "The user you are trying to edit does not exist.",
      title: "Not Found",
    })
  }

  return json({ ...setFormDefaults("edit-user", user), user })
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { db } = context
  const { userId } = zx.parseParams(params, { userId: z.string() })

  await isUserAdmin(request)

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw notFound({
      message: "The user does not exist.",
      title: "User not found",
    })
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
    <Form
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
      <Input label="First Name" name="firstName" required />
      <Input label="Last Name" name="lastName" required />
      <Input
        description="The user's email address to receive email notifications"
        label="Email"
        name="email"
        required
      />
      <Input
        description="The user's phone number to receive WhatsApp notifications"
        label="Phone"
        name="phone"
      />

      <ListRadioGroup
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

      <SubmitButton loadingText="Updating...">Update</SubmitButton>
    </Form>
  )
}
