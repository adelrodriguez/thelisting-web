import { Outlet } from "@remix-run/react"
import { useTranslation } from "react-i18next"

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
