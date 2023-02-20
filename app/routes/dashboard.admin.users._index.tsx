import type { User } from "@prisma/client"
import { UserRole } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { Link, useNavigate } from "@remix-run/react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { forbidden } from "remix-utils"

import { Button } from "~/components/common"
import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import { goToLogin, json, useLoaderData } from "~/utils/remix"

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw goToLogin()
  }

  if (user.role !== UserRole.Admin) {
    throw forbidden("You do not have permission to access this page.")
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return json({ users })
}

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor("firstName", {
    header: "First Name",
  }),
  columnHelper.accessor("lastName", {
    header: "Last Name",
  }),
  columnHelper.accessor("email", {
    header: "email",
  }),
  columnHelper.accessor("phone", {
    header: "phone",
  }),
  columnHelper.accessor("role", {
    header: "Role",
  }),
  columnHelper.accessor("lastLoginAt", {
    cell: (props) => {
      const lastLoginAt = props.getValue()

      if (!lastLoginAt) {
        return null
      }

      return format(lastLoginAt, "yyyy-MM-dd HH:mm:ss")
    },
    header: "Last Login At",
  }),
]

export default function AdminToolsUserManagementPage() {
  const { users } = useLoaderData<typeof loader>()
  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  })
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-teal-600">
          Admin Tools
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
          User Management
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
          Create, edit, and delete users.
        </p>
      </div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Listings</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users. Click on a user to edit it.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/dashboard/admin/users/new">
            <Button>Create User</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          scope="col"
                          className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                          key={header.id}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      className="hover:cursor-pointer hover:bg-gray-50"
                      key={row.id}
                      onClick={() => {
                        navigate(row.original.id, {
                          relative: "path",
                        })
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
