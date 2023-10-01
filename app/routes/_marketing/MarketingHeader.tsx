import { Dialog } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { Link, useLocation } from "@remix-run/react"
import clsx from "clsx"
import { useState } from "react"

import { LanguageCurrencySelector } from "~/components/marketing"
import { THE_LISTING_LOGO_BLACK, THE_LISTING_LOGO_WHITE } from "~/config/consts"

export default function MarketingHeader({
  navigationItems,
  loginText,
}: {
  navigationItems: Array<{ href: string; key: string }>
  loginText: string
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isIndex = location.pathname === "/"

  return (
    <header className="absolute top-0 z-10 w-full px-6 pt-6 lg:px-12">
      <nav aria-label="Global" className="flex items-center justify-between">
        <div className="flex lg:flex-1">
          <div className="hidden items-center lg:flex">
            <div
              className={clsx(
                "space-x-2",
                isIndex ? "text-white" : "text-gray-700",
              )}
            >
              {navigationItems.map((item) => (
                <Link
                  className={clsx(
                    "rounded-lg px-3 py-2 text-sm font-medium xl:text-base",
                    isIndex ? "hover:bg-gray-700/70" : "hover:bg-gray-200",
                  )}
                  key={item.key}
                  to={item.href}
                >
                  {item.key}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="flex lg:hidden">
          <button
            className={clsx(
              "-m-2.5 inline-flex items-center justify-center rounded-md p-2.5",
              isIndex ? "text-white" : "text-gray-700",
            )}
            onClick={() => setMobileMenuOpen(true)}
            type="button"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <Link
          className="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform"
          to="/"
        >
          <img
            alt="The Listing"
            className="h-10 xl:h-12"
            src={isIndex ? THE_LISTING_LOGO_WHITE : THE_LISTING_LOGO_BLACK}
          />
        </Link>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            className="bg-transparent text-base font-semibold leading-6 text-white"
            to="/login"
          >
            {loginText} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
      <Dialog as="div" onClose={setMobileMenuOpen} open={mobileMenuOpen}>
        <Dialog.Panel className="fixed inset-0 z-10 overflow-y-auto bg-white px-6 py-6 lg:hidden">
          <div className="flex items-center justify-end">
            <Link
              className="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform"
              to="/"
            >
              <img
                alt="The Listing"
                className="h-10"
                src={THE_LISTING_LOGO_BLACK}
              />
            </Link>

            <button
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigationItems.map((item) => (
                  <a
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10"
                    href={item.href}
                    key={item.key}
                  >
                    {item.key}
                  </a>
                ))}
              </div>
              <div className="py-6">
                <Link
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-400/10"
                  to="/login"
                >
                  {loginText} <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
              <div className="py-6">
                <h3 className="text-base font-medium text-gray-700">
                  Language &amp; Currency
                </h3>
                <LanguageCurrencySelector />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
