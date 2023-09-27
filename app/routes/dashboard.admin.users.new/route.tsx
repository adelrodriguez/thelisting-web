import { UserRole } from "@prisma/client"
import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { useSnackbar } from "notistack"
import { validationError } from "remix-validated-form"
import { route } from "routes-gen"

import { Form, Input, ListRadioGroup, SubmitButton } from "~/components/form"
import { isUserAdmin } from "~/utils/auth.server"
import { RouteHandle, unauthorized } from "~/utils/remix"
import { UserSchema } from "~/utils/user"

const validator = withZod(UserSchema)

export const handle: RouteHandle = {
  crumb: () => ({
    href: route("/dashboard/admin/users/new"),
    name: "New User",
  }),
  id: "dashboard-admin-users-new",
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { db } = context

  const user = await isUserAdmin(request)

  if (!user) {
    throw unauthorized({ message: "You must be logged in to create a listing" })
  }

  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  await db.user.create({
    data: result.data,
  })

  return redirect("/dashboard/admin/users")
}

export default function CreateListingsPage() {
  const { enqueueSnackbar } = useSnackbar()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-gray-600">
          Users
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
          Create a new user
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
          Create a new user to manage their listings.
        </p>
      </div>
      <Form
        className="m-auto mt-8 flex w-full max-w-xl flex-col gap-y-6"
        id="editUser"
        method="POST"
        onSubmit={() => {
          enqueueSnackbar("User created 🎉", {
            description: "The user was successfully created",
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
          required
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

        <SubmitButton loadingText="Updating...">Create</SubmitButton>
      </Form>
    </div>
  )
}
