import { redirect } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { StatusCodes } from "http-status-codes"
import { useTranslation } from "react-i18next"

import { isProduction } from "~/config/vars"

import Footer from "./Footer"
import MarketingHeader from "./MarketingHeader"

const headerNavigation = [
  { href: "/pricing", key: "navigation.pricing" },
  { href: "/about", key: "navigation.about" },
  { href: "#", key: "navigation.examples" },
  { href: "#", key: "navigation.faq" },
  { href: "#", key: "navigation.contact" },
]

export const handle = { i18n: "common" }

export function loader() {
  // TODO: remove this once we're live
  if (isProduction) {
    return redirect("https://thelisting.do", {
      status: StatusCodes.TEMPORARY_REDIRECT,
    })
  }

  return null
}

export default function MarketingLayout() {
  const { t } = useTranslation(handle.i18n)

  return (
    <>
      <MarketingHeader
        navigationItems={headerNavigation.map((item) => ({
          ...item,
          key: t(item.key),
        }))}
        loginText={t("login")}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
