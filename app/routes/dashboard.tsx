import { Disclosure, Menu, Transition } from "@headlessui/react"
import {
  Bars3Icon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  WrenchIcon,
  BellIcon,
} from "@heroicons/react/24/outline"
import type { LoaderArgs } from "@remix-run/node"
import { Link, NavLink, Outlet } from "@remix-run/react"
import clsx from "clsx"
import { SnackbarProvider } from "notistack"
import { Fragment } from "react"

import { Logo } from "~/components/branding"
import { Notification } from "~/components/common"
import { Breadcrumbs } from "~/components/dashboard"
import auth from "~/helpers/auth.server"
import { json, useLoaderData } from "~/utils/remix"

const navigation = [
  {
    href: "/dashboard",
    icon: HomeIcon,
    name: "Dashboard",
    segment: "dashboard",
  },
  {
    href: "/dashboard/listings",
    icon: UsersIcon,
    name: "Listings",
    segment: "listings",
  },
  {
    href: "/dashboard/admin",
    icon: WrenchIcon,
    name: "Admin Tools",
    segment: "admin",
  },
]

const userNavigation = [
  { href: "/dashboard/settings", name: "Settings" },
  { href: "/logout", name: "Logout" },
]

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  return json({ user })
}

export default function DashboardLayout() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 w-screen">
        <Disclosure as="nav" className="bg-gray-600">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Logo
                        width={32}
                        height={32}
                        className="h-8 w-8 fill-white"
                      />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                              clsx(
                                {
                                  "bg-gray-700 text-white": isActive,
                                  "text-white hover:bg-gray-500 hover:bg-opacity-75":
                                    !isActive,
                                },
                                "rounded-md px-3 py-2 text-sm font-medium"
                              )
                            }
                            end={item.href === "/dashboard"}
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      <button
                        type="button"
                        className="rounded-full bg-gray-600 p-1 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600">
                            <span className="sr-only">Open user menu</span>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                              <span className="text-sm font-medium leading-none text-white">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </span>
                            </span>
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    to={item.href}
                                    className={clsx(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-600 p-2 text-gray-200 hover:bg-gray-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="px-2 pt-2 pb-3 sm:px-3">
                  {navigation.map((item) => (
                    <NavLink
                      to={item.href}
                      key={item.name}
                      end={item.href === "/dashboard"}
                    >
                      {({ isActive }) => (
                        <Disclosure.Button
                          className={clsx(
                            "my-2 block rounded-md px-3 py-2 text-base font-medium",
                            {
                              "bg-gray-700 text-white": isActive,
                              "text-white hover:bg-gray-500 hover:bg-opacity-75":
                                !isActive,
                            }
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {item.name}
                        </Disclosure.Button>
                      )}
                    </NavLink>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                        <span className="text-sm font-medium leading-none text-white">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        {user.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-auto flex-shrink-0 rounded-full bg-gray-600 p-1 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-500 hover:bg-opacity-75"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <div className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl py-3 px-4 sm:px-6 lg:px-8">
            <Breadcrumbs />
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-auto bg-gray-50">
        <SnackbarProvider
          Components={{
            error: Notification,
            info: Notification,
            success: Notification,
            warning: Notification,
          }}
          anchorOrigin={{
            horizontal: "right",
            vertical: "top",
          }}
          autoHideDuration={5 * 1000}
        >
          <div className="mx-auto h-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </SnackbarProvider>
      </main>
    </div>
  )
}
