import { Disclosure, Menu, Transition } from "@headlessui/react"
import {
  Bars3Icon,
  BellIcon,
  HomeIcon,
  UsersIcon,
  WrenchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import { SnackbarProvider } from "notistack"
import posthog from "posthog-js"
import { Fragment, useEffect } from "react"
import { route } from "routes-gen"

import { Logo } from "~/components/branding"
import { Notification } from "~/components/common"
import auth from "~/helpers/auth.server"
import { UserProvider } from "~/utils/hooks"
import { userTransformer } from "~/utils/transformers"

import Breadcrumbs from "./Breadcrumbs"

const navigation = [
  {
    href: route("/dashboard"),
    icon: HomeIcon,
    name: "Dashboard",
    segment: "dashboard",
  },
  {
    href: route("/dashboard/listings"),
    icon: UsersIcon,
    name: "Listings",
    segment: "listings",
  },
  {
    href: route("/dashboard/admin"),
    icon: WrenchIcon,
    name: "Admin Tools",
    segment: "admin",
  },
]

const userNavigation = [
  { href: route("/dashboard/settings"), name: "Settings" },
  { href: route("/logout"), name: "Logout" },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  return json({
    user: userTransformer(user),
  })
}

export const meta: MetaFunction = () => [
  { title: "Dashboard | The Listing" },
  { content: "width=device-width, initial-scale=1", name: "viewport" },
]

export default function DashboardLayout() {
  const { user } = useLoaderData<typeof loader>()

  useEffect(() => {
    // Identify the logged in user
    posthog.identify(user.id, { email: user.email, name: user.fullName })
  }, [user.id, user.email, user.fullName])

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
                      <Logo className="h-8 w-8 fill-white" height={32} width={32} />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <NavLink
                            className={({ isActive }) =>
                              clsx(
                                {
                                  "bg-gray-700 text-white": isActive,
                                  "text-white hover:bg-gray-500 hover:bg-opacity-75": !isActive,
                                },
                                "rounded-md px-3 py-2 text-sm font-medium",
                              )
                            }
                            end={item.href === route("/dashboard")}
                            key={item.name}
                            to={item.href}
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
                        className="rounded-full bg-gray-600 p-1 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                        type="button"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon aria-hidden="true" className="h-6 w-6" />
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
                                    className={clsx(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700",
                                    )}
                                    to={item.href}
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
                        <XMarkIcon aria-hidden="true" className="block h-6 w-6" />
                      ) : (
                        <Bars3Icon aria-hidden="true" className="block h-6 w-6" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="px-2 pb-3 pt-2 sm:px-3">
                  {navigation.map((item) => (
                    <NavLink end={item.href === route("/dashboard")} key={item.name} to={item.href}>
                      {({ isActive }) => (
                        <Disclosure.Button
                          aria-current={isActive ? "page" : undefined}
                          className={clsx("my-2 block rounded-md px-3 py-2 text-base font-medium", {
                            "bg-gray-700 text-white": isActive,
                            "text-white hover:bg-gray-500 hover:bg-opacity-75": !isActive,
                          })}
                        >
                          {item.name}
                        </Disclosure.Button>
                      )}
                    </NavLink>
                  ))}
                </div>
                <div className="border-t border-gray-700 pb-3 pt-4">
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
                      <div className="text-sm font-medium text-gray-300">{user.email}</div>
                    </div>
                    <button
                      className="ml-auto flex-shrink-0 rounded-full bg-gray-600 p-1 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                      type="button"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon aria-hidden="true" className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        as="a"
                        className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-500 hover:bg-opacity-75"
                        href={item.href}
                        key={item.name}
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
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <Breadcrumbs />
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-auto bg-gray-50">
        <UserProvider user={user}>
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
            maxSnack={7}
          >
            <div className="mx-auto h-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </SnackbarProvider>
        </UserProvider>
      </main>
    </div>
  )
}
